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
    int forcedWidth;
    int forcedHeight;
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

    ImageBuffer Crop(int forcedWidth, int forcedHeight) const
    {
        // Find crop boundary.
        int x1 = width - 1;
        int x2 = 0;
        int y1 = height - 1;
        int y2 = 0;

        // Look for min x, max x, min y, max y where there is a nonzero alpha value.
        int offset = 0;
        for (int y=0; y < height; ++y)
        {
            for (int x=0; x < width; ++x)
            {
                if (fabs(pixel[offset++].alpha) >= 0.01)
                {
                    if (x < x1) x1 = x;
                    if (x > x2) x2 = x;
                    if (y < y1) y1 = y;
                    if (y > y2) y2 = y;
                }
            }
        }
        
        if ((forcedWidth > 0) && (forcedHeight > 0))
        {
            // Override with manual cropping dimensions.
            x2 = x1 + forcedWidth  - 1;
            y2 = y1 + forcedHeight - 1;
        }

        if (x1 > x2 || y1 > y2)
        {
            throw "Could not crop image - might be empty?";
        }

        int cw = x2 - x1 + 1;
        int ch = y2 - y1 + 1;

#if 0
        std::cout << "Cropped " << width << "x" << height <<
            " to " << cw << "x" << ch <<
            " (x1=" << x1 << " y1=" << y1 << " x2=" << x2 << " y2=" << y2 << ")" << std::endl;
#endif

        ImageBuffer crop(cw, ch);
        for (int y=0; y < ch; ++y)
        {
            for (int x=0; x < cw; ++x)
            {
                crop.SetPixel(x, y, GetPixel(x+x1, y+y1));
            }
        }

        return crop;
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

                // The only part of each input pixel that affects the shadow is the alpha value.
                // The more opaque the input pixel is, the more intense the shadow.
                psum.red   += z;
                psum.green += z;
                psum.blue  += z;
                psum.alpha += z * image.GetPixel(ix+dx, iy+dy).alpha;
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
    if (argc < 10)
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
        bool ok = false;
        if (argc == 12)
        {
            ok = ScanInteger(argv[10], parms.forcedWidth,  "forcedWidth" ) &&
                 ScanInteger(argv[11], parms.forcedHeight, "forcedHeight");
        }
        else if (argc == 10)
        {
            ok = true;
        }
        else
        {
            PrintUsage();
        }
        
        if (!ok)
        {
            return 1;
        }
        
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
    cout << "USAGE:  pngblur in.png out.png dx dy radius red green blue alpha [forcedWidth forcedHeight]" << endl;
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

Pixel MixPixels(const Pixel& blur, const Pixel& orig, double shadowAlpha)
{
    double blurAlpha = shadowAlpha * blur.alpha;
    double alpha = 1.0 - (1.0 - orig.alpha)*(1.0 - blurAlpha);

    // Special case: avoid division by zero.
    // If alpha is very close to 0, it means the resulting pixel is transparent,
    // so RGB values don't matter anyway.  Just return a pure black and completely transparent pixel.
    if (fabs(alpha) < 1.0e-5)
    {
        return Pixel();
    }

    return Pixel (
        (orig.alpha*orig.red   + (1.0 - orig.alpha)*(blurAlpha*blur.red  )) / alpha,
        (orig.alpha*orig.green + (1.0 - orig.alpha)*(blurAlpha*blur.green)) / alpha,
        (orig.alpha*orig.blue  + (1.0 - orig.alpha)*(blurAlpha*blur.blue )) / alpha,
        alpha
    );
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
    const double sr = MathFromByte(parms.red);
    const double sg = MathFromByte(parms.green);
    const double sb = MathFromByte(parms.blue);
    for (int y=0; y < blurHeight; ++y)
    {
        for (int x=0; x < blurWidth; ++x)
        {
            Pixel p = conv.Convolve(original, x-belt, y-belt);
            p.red   *= sr;
            p.green *= sg;
            p.blue  *= sb;
            blurred.SetPixel(x, y, p);
        }
    }

    // Create the output image by mixing the original image and the blurred image.
    const double shadowAlpha = MathFromByte(parms.alpha);
    ImageBuffer output(outputWidth, outputHeight);
    const int oh = static_cast<int>(outputHeight);
    const int ow = static_cast<int>(outputWidth);
    for (int oy=0; oy < oh; ++oy)
    {
        int by = oy;
        int iy = oy - belt;
        if (parms.dy >= 0) { by -= parms.dy; } else { iy += parms.dy; }

        for (int ox=0; ox < ow; ++ox)
        {
            int bx = ox;
            int ix = ox - belt;
            if (parms.dx >= 0) { bx -= parms.dx; } else { ix += parms.dx; }

            Pixel bp = blurred.GetPixel(bx, by);
            Pixel op = original.GetPixel(ix, iy);
            Pixel mp = MixPixels(bp, op, shadowAlpha);
            output.SetPixel(ox, oy, mp);
        }
    }

    // Automatically crop the output to the smallest rectangle that contains
    // all pixels with a (significantly) nonzero alpha value.
    ImageBuffer cropped = output.Crop(parms.forcedWidth, parms.forcedHeight);

    outputImage  = cropped.MakeOutputVector();
    outputWidth  = cropped.Width();
    outputHeight = cropped.Height();

    return true;
}
