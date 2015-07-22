/*
    pngblur.cpp  -  Don Cross  -  http://cosinekitty.com
*/

#include <cstdio>
#include <cmath>
#include <iostream>
#include "lodepng.h"

inline int AbsoluteValue(int x)
{
    return static_cast<int>((x < 0) ? -x : x);
}

struct Parameters
{
    int dx;
    int dy;
    int radius;
    int red;
    int green;
    int blue;
    int alpha;
};

const int BytesPerPixel = 4;            // red, green, blue, alpha

struct Pixel
{
    double  red;
    double  green;
    double  blue;
    double  alpha;

    Pixel(double _red, double _green, double _blue, double _alpha)
        : red(_red)
        , green(_green)
        , blue(_blue)
        , alpha(_alpha)
    {
    }

    Pixel()
        : red(0.0)
        , green(0.0)
        , blue(0.0)
        , alpha(0.0)
    {
    }
};

inline double MathFromByte(unsigned char b)
{
    return static_cast<double>(b) / 255.0;
}

inline unsigned char ByteFromMath(double m)
{
    long r = std::lround(m * 255.0);
    if (r < 0 || r > 255)
    {
        throw "Rounding error";
    }

    return static_cast<unsigned char>(r);
}

using ImageVector = std::vector<unsigned char>;

class ImageBuffer
{
private:
    std::vector<Pixel> pixel;
    int width;
    int height;

public:
    ImageBuffer(int _width, int _height)
        : pixel(_width*_height, Pixel())
        , width(_width)
        , height(_height)
    {
    }

    ImageBuffer(int _width, int _height, const ImageVector& bytes)
        : pixel(_width*_height, Pixel())
        , width(_width)
        , height(_height)
    {
        int numPixels = width * height;
        if (static_cast<int>(bytes.size()) != numPixels * BytesPerPixel)
        {
            throw "Invalid image vector size.";
        }

        for (int offset=0; offset < numPixels; ++offset)
        {
            pixel[offset].red   = MathFromByte(bytes[4*offset + 0]);
            pixel[offset].green = MathFromByte(bytes[4*offset + 1]);
            pixel[offset].blue  = MathFromByte(bytes[4*offset + 2]);
            pixel[offset].alpha = MathFromByte(bytes[4*offset + 3]);
        }
    }

    int Width() const
    {
        return width;
    }

    int Height() const
    {
        return height;
    }

    Pixel GetPixel(int x, int y) const
    {
        if (x < 0 || y < 0 || x >= width || y >= height)
        {
            return Pixel();     // return transparent pixel for any coordinates that are out of bounds
        }
        return pixel[x + width*y];
    }

    void SetPixel(int x, int y, const Pixel& p)
    {
        if (x < 0 || y < 0 || x >= width || y >= height)
        {
            throw "Cannot set pixel outside bounds.";
        }
        pixel[x + width*y] = p;
    }

    ImageVector MakeOutputVector() const
    {
        ImageVector output(BytesPerPixel * width * height);
        int offset = 0;
        for (int y=0; y < height; ++y)
        {
            for (int x=0; x < width; ++x)
            {
                const Pixel& p = pixel[offset];
                output[4*offset + 0] = ByteFromMath(p.red);
                output[4*offset + 1] = ByteFromMath(p.green);
                output[4*offset + 2] = ByteFromMath(p.blue);
                output[4*offset + 3] = ByteFromMath(p.alpha);

                ++offset;
            }
        }

        return output;
    }
};

class ConvolutionBuffer
{
private:
    int dimension;
    std::vector<double> vec;

public:
    ConvolutionBuffer(int _radius)
        : dimension(3*_radius + 1)
    {
        if (dimension <= 0 || dimension > 1000)
        {
            throw "ConvolutionBuffer dimension is invalid.";
        }

        vec = std::vector<double>(dimension*dimension, 0.0);

        const double denom = static_cast<double>(2 * _radius * _radius);

        int offset = 0;
        for (int y=0; y < dimension; ++y)
        {
            for (int x=0; x < dimension; ++x)
            {
                double numer = static_cast<double>(-(x*x + y*y));
                vec[offset++] = exp(numer / denom);
            }
        }

        // Normalize by the sum over the entire space x, y = -(dimension-1)..+(dimension-1).
        double sum = 0.0;
        for (int y = 1-dimension; y < dimension; ++y)
        {
            for (int x = 1-dimension; x < dimension; ++x)
            {
                sum += Factor(x, y);
            }
        }

        offset = 0;
        for (int y=0; y < dimension; ++y)
        {
            for (int x=0; x < dimension; ++x)
            {
                vec[offset++] /= sum;
            }
        }
    }

    double Factor(int x, int y) const
    {
        int ax = AbsoluteValue(x);
        int ay = AbsoluteValue(y);
        if (ax >= dimension || ay >= dimension)
        {
            throw "Convolution coordinates out of bounds.";
        }
        return vec[ax + ay*dimension];
    }

    Pixel Convolve(const ImageBuffer& image, int ix, int iy) const
    {
        Pixel psum;
        for (int dx = 1-dimension; dx < dimension; ++dx)
        {
            for (int dy = 1-dimension; dy < dimension; ++dy)
            {
                double z = Factor(dx, dy);
                Pixel pa = image.GetPixel(ix+dx, iy+dy);
                psum.red   += z * pa.red;
                psum.green += z * pa.green;
                psum.blue  += z * pa.blue;
                psum.alpha += z * pa.alpha;
            }
        }
        return psum;
    }
};

void PrintUsage();
bool ScanInteger(const char *text, int& value, const char *name);

bool Transform(
    const ImageVector& inputImage,
    unsigned inputWidth,
    unsigned inputHeight,
    ImageVector& outputImage,
    unsigned& outputWidth,
    unsigned& outputHeight,
    const Parameters& parms
);

int main(int argc, const char *argv[])
{
    if (argc != 10)
    {
        PrintUsage();
        return 1;
    }

    const char * const inFileName  = argv[1];
    const char * const outFileName = argv[2];
    Parameters parms;
    memset(&parms, 0, sizeof(parms));

    if (ScanInteger(argv[3], parms.dx,     "dx") &&
        ScanInteger(argv[4], parms.dy,     "dy") &&
        ScanInteger(argv[5], parms.radius, "radius") &&
        ScanInteger(argv[6], parms.red,    "red") &&
        ScanInteger(argv[7], parms.green,  "green") &&
        ScanInteger(argv[8], parms.blue,   "blue") &&
        ScanInteger(argv[9], parms.alpha,  "alpha"))
    {
        using namespace std;
        vector<unsigned char> inputImage;   // raw pixels in RGBA order
        unsigned inputWidth;
        unsigned inputHeight;
        unsigned error = lodepng::decode(inputImage, inputWidth, inputHeight, inFileName);
        if (error)
        {
            cerr << "lodepng decoder error " << error << ": " << lodepng_error_text(error) << endl;
            return 2;
        }

        vector<unsigned char> outputImage;
        unsigned outputWidth = 0;
        unsigned outputHeight = 0;
        if (Transform(inputImage, inputWidth, inputHeight, outputImage, outputWidth, outputHeight, parms))
        {
            error = lodepng::encode(outFileName, outputImage, outputWidth, outputHeight);
            if (error)
            {
                cerr << "lodepng encoder error " << error << ": " << lodepng_error_text(error) << endl;
                return 3;
            }
        }

        return 0;
    }

    return 1;
}

void PrintUsage()
{
    using namespace std;

    cout << endl;
    cout << "USAGE:  pngblur in.png out.png dx dy radius red green blue alpha" << endl;
    cout << endl;
}

bool ScanInteger(const char *text, int& value, const char *name)
{
    if (1 == sscanf(text, "%i", &value))
    {
        return true;
    }
    std::cerr << "ERROR: invalid value for " << name << ": '" << text << "'" << std::endl;
    return false;
}

bool Transform(
    const ImageVector& inputImage,
    unsigned inputWidth,
    unsigned inputHeight,
    ImageVector& outputImage,
    unsigned& outputWidth,
    unsigned& outputHeight,
    const Parameters& parms)
{
    using namespace std;

    // Calculate output dimensions from input dimensions and parameters:
    // - Dilate the width and height by six times the given radius:
    //   on either side, we need 3 standard deviations, and that is what "radius" means.
    // - Account for the shadow's shift (dx, dy).
    const int radius = AbsoluteValue(parms.radius);
    const int belt = 3 * radius;
    const int blurWidth  = inputWidth  + 6*radius;
    const int blurHeight = inputHeight + 6*radius;

    outputWidth  = blurWidth  + AbsoluteValue(parms.dx);
    outputHeight = blurHeight + AbsoluteValue(parms.dy);

    // Safety valve: we won't output anything bigger than 1000x1000 pixels.
    // Without this check, we risk allocating an excessive amount of memory.
    if (outputWidth > 1000 || outputHeight > 1000)
    {
        std::cerr << "Excessive output dimensions: " << outputWidth << "x" << outputHeight << std::endl;
        return false;
    }

    // Done with parameter checking and calculating dimensions.
    // Convert the byte-vector into a 2D buffer of pixel structs.
    ImageBuffer original(inputWidth, inputHeight, inputImage);

    // Calculate the Gaussian convolution matrix 'conv'.
    ConvolutionBuffer conv(radius);

    // Create a blurred image with extra space around the sides.
    ImageBuffer blurred(blurWidth, blurHeight);
    for (int y=0; y < blurHeight; ++y)
    {
        for (int x=0; x < blurWidth; ++x)
        {
            Pixel p = conv.Convolve(original, x-belt, y-belt);
            blurred.SetPixel(x, y, p);
        }
    }

#if 1
    outputWidth = blurWidth;
    outputHeight = blurHeight;
    outputImage = blurred.MakeOutputVector();
#else
    // Create the output image by mixing the original image and the blurred image.
    ImageBuffer output(outputWidth, outputHeight);
    outputImage = output.MakeOutputVector();
#endif

    return true;
}
