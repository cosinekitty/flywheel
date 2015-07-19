#!/usr/bin/env python
#--------------------------------------------------------------------------------------
#   MakeHashSalt.py  -  Don Cross  -  July 2015
#
#   Generates pseudo-random hash values used by the Flywheel chess engine.
#
#   Python has a very nice pseudorandom generator (Mersenne Twister).
#   https://docs.python.org/2/library/random.html
#   https://en.wikipedia.org/wiki/Mersenne_Twister
#
#--------------------------------------------------------------------------------------
#
#    The MIT License (MIT)
#
#    Copyright (c) 2015 Don Cross
#
#    Permission is hereby granted, free of charge, to any person obtaining a copy
#    of this software and associated documentation files (the "Software"), to deal
#    in the Software without restriction, including without limitation the rights
#    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
#    copies of the Software, and to permit persons to whom the Software is
#    furnished to do so, subject to the following conditions:
#
#    The above copyright notice and this permission notice shall be included in all
#    copies or substantial portions of the Software.
#
#    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
#    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
#    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
#    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
#    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
#    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
#    SOFTWARE.
#
#--------------------------------------------------------------------------------------
import random

random.seed(8675309)

StartTag = '//=====BEGIN HASH SALT====='
EndTag   = '//=====END HASH SALT====='

def NextRand():
    s = hex(random.getrandbits(32))[2:-1]
    while len(s) < 8:
        s = '0' + s
    return '0x' + s

def NextTuple():
    return '[' + NextRand() + ',' + NextRand() + ',' + NextRand() + ']'

with open('hash.ts', 'wt') as outfile:
    outfile.write(StartTag + '\n')
    outfile.write('\n')
    outfile.write('var WhiteToMoveSalt = ' + NextTuple() + ';\n')
    outfile.write('\n')
    outfile.write('var CastlingRightsSalt = {\n')
    outfile.write('    wk: ' + NextTuple() + '\n')
    outfile.write(',   wq: ' + NextTuple() + '\n')
    outfile.write(',   bk: ' + NextTuple() + '\n')
    outfile.write(',   bq: ' + NextTuple() + '\n')
    outfile.write('};\n')
    outfile.write('\n')

    outfile.write('var EnPassantFileSalt = [\n')
    delim = ' '
    for epFile in 'abcdefgh':
        outfile.write(delim)
        delim = ','
        outfile.write('   ' + NextTuple() + '  // ' + epFile + '\n')
    outfile.write('];\n')

    outfile.write('\n')
    outfile.write('var PieceHashSalt = [\n')
    outfile.write('    //               Pawn                               Knight                              Bishop                               Rook                               Queen                               King\n')
    outfile.write('    // ---------------------------------   ---------------------------------   --------------------------------    ---------------------------------   --------------------------------    --------------------------------\n')

    delim = ' '
    for squareIndex in xrange(64):
        outfile.write(delim)
        delim = ','
        outfile.write('   [ [0, 0, 0]\n    ')
        for pieceIndex in xrange(12):
            if pieceIndex % 6 == 0:
                if pieceIndex == 6:
                    outfile.write('   // ' + 'abcdefgh'[squareIndex % 8] + '12345678'[squareIndex / 8] + ' W\n    ')
            outfile.write(', ')
            outfile.write(NextTuple())
        outfile.write(' ] //    B\n')
    outfile.write('];\n')
    outfile.write('\n')
    outfile.write(EndTag + '\n')
