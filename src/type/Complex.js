/**
 * @constructor Complex
 *
 * A complex value can be constructed in the following ways:
 *     var a = new Complex(re, im);
 *     var b = new Complex(str);
 *     var c = new Complex();
 *     var d = Complex.parse(str);
 *
 * The constructor new Complex(str) is equivalent with Complex.parse(str), but
 * the constructor will throw an error in case of an invalid string, whilst the
 * parse method will return null.
 *
 * Example usage:
 *     var a = new Complex(3, -4);    // 3 - 4i
 *     var b = new Complex('2 + 6i'); // 2 + 6i
 *     var c = new Complex();         // 0 + 0i
 *     var d = math.add(a, b);        // 5 + 2i
 *
 * @param {Number | String} re   A number with the real part of the complex
 *                               value, or a string containing a complex number
 * @param {Number} [im]          The imaginary part of the complex value
 */
function Complex(re, im) {
    if (this.constructor != Complex) {
        throw new SyntaxError(
            'Complex constructor must be called with the new operator');
    }

    switch (arguments.length) {
        case 2:
            // re and im numbers provided
            if (!isNumber(re) || !isNumber(im)) {
                throw new TypeError(
                    'Two numbers or a single string expected in Complex constructor');
            }
            this.re = re;
            this.im = im;
            break;

        case 1:
            // parse string into a complex number
            if (!isString(re)) {
                throw new TypeError(
                    'Two numbers or a single string expected in Complex constructor');
            }
            var c = Complex.parse(re);
            if (c) {
                return c;
            }
            else {
                throw new SyntaxError('String "' + re + '" is no valid complex number');
            }
            break;

        case 0:
            // no parameters. Set re and im zero
            this.re = 0;
            this.im = 0;
            break;

        default:
            throw new SyntaxError(
                'Wrong number of arguments in Complex constructor ' +
                    '(' + arguments.length + ' provided, 0, 1, or 2 expected)');
    }
}

math.Complex = Complex;

// Complex parser methods in a closure
(function () {
    var text, index, c;

    function skipWhitespace() {
        while (c == ' ' || c == '\t') {
            next();
        }
    }

    function isDigitDot (c) {
        return ((c >= '0' && c <= '9') || c == '.');
    }

    function isDigit (c) {
        return ((c >= '0' && c <= '9'));
    }

    function next() {
        index++;
        c = text[index];
    }

    function revert(oldIndex) {
        index = oldIndex;
        c = text[index];
    }

    function parseNumber () {
        var number = '';
        var oldIndex = index;

        if (c == '+') {
            next();
        }
        else if (c == '-') {
            number += c;
            next();
        }

        if (!isDigitDot(c)) {
            // a + or - must be followed by a digit
            revert(oldIndex);
            return null;
        }

        // TODO only allow a single dot, and enforce at least one digit before or after the dot
        while (isDigitDot(c)) {
            number += c;
            next();
        }

        // check for scientific notation like "2.3e-4" or "1.23e50"
        if (c == 'E' || c == 'e') {
            number += c;
            next();

            if (c == '+' || c == '-') {
                number += c;
                next();
            }

            // Scientific notation MUST be followed by an exponent
            if (!isDigit(c)) {
                // this is no legal number, exponent is missing.
                revert(oldIndex);
                return null;
            }

            while (isDigit(c)) {
                number += c;
                next();
            }
        }

        return number;
    }

    function parseComplex () {
        // check for 'i', '-i', '+i'
        var cnext = text[index + 1];
        if (c == 'I' || c == 'i') {
            next();
            return '1';
        }
        else if ((c == '+' || c == '-') && (cnext == 'I' || cnext == 'i')) {
            var number = (c == '+') ? '1' : '-1';
            next();
            next();
            return number;
        }

        return null;
    }

    /**
     * Parse a complex number from a string. For example Complex.parse("2 + 3i")
     * will return a Complex value where re = 2, im = 3.
     * Returns null if provided string does not contain a valid complex number.
     * @param {String} str
     * @returns {Complex | null} complex
     */
    Complex.parse = function parse(str) {
        text = str;
        index = -1;
        c = '';

        if (!isString(text)) {
            return null;
        }

        next();
        skipWhitespace();
        var first = parseNumber();
        if (first) {
            if (c == 'I' || c == 'i') {
                // pure imaginary number
                next();
                skipWhitespace();
                if (c) {
                    // garbage at the end. not good.
                    return null;
                }

                return new Complex(0, Number(first));
            }
            else {
                // complex and real part
                skipWhitespace();
                var separator = c;
                if (separator != '+' && separator != '-') {
                    // pure real number
                    skipWhitespace();
                    if (c) {
                        // garbage at the end. not good.
                        return null;
                    }

                    return new Complex(Number(first), 0);
                }
                else {
                    // complex and real part
                    next();
                    skipWhitespace();
                    var second = parseNumber();
                    if (second) {
                        if (c != 'I' && c != 'i') {
                            // 'i' missing at the end of the complex number
                            return null;
                        }
                        next();
                    }
                    else {
                        second = parseComplex();
                        if (!second) {
                            // imaginary number missing after separator
                            return null;
                        }
                    }

                    if (separator == '-') {
                        if (second[0] == '-') {
                            second =  '+' + second.substring(1);
                        }
                        else {
                            second = '-' + second;
                        }
                    }

                    next();
                    skipWhitespace();
                    if (c) {
                        // garbage at the end. not good.
                        return null;
                    }

                    return new Complex(Number(first), Number(second));
                }
            }
        }
        else {
            // check for 'i', '-i', '+i'
            first = parseComplex();
            if (first) {
                skipWhitespace();
                if (c) {
                    // garbage at the end. not good.
                    return null;
                }

                return new Complex(0, Number(first));
            }
        }

        return null;
    };

})();

/**
 * Test whether value is a Complex value
 * @param {*} value
 * @return {Boolean} isComplex
 */
function isComplex(value) {
    return (value instanceof Complex);
}

/**
 * Create a copy of the complex value
 * @return {Complex} copy
 */
Complex.prototype.copy = function () {
    return new Complex(this.re, this.im);
};

/**
 * Get string representation of the Complex value
 * @return {String} str
 */
Complex.prototype.toString = function () {
    var str = '';

    if (this.im == 0) {
        // real value
        str = util.format(this.re);
    }
    else if (this.re == 0) {
        // purely complex value
        if (this.im == 1) {
            str = 'i';
        }
        else if (this.im == -1) {
            str = '-i';
        }
        else {
            str = util.format(this.im) + 'i';
        }
    }
    else {
        // complex value
        if (this.im > 0) {
            if (this.im == 1) {
                str = util.format(this.re) + ' + i';
            }
            else {
                str = util.format(this.re) + ' + ' + util.format(this.im) + 'i';
            }
        }
        else {
            if (this.im == -1) {
                str = util.format(this.re) + ' - i';
            }
            else {
                str = util.format(this.re) + ' - ' + util.format(Math.abs(this.im)) + 'i';
            }
        }
    }

    return str;
};

/**
 * Type documentation
 */
Complex.doc = {
    'name': 'Complex',
    'category': 'type',
    'syntax': [
        'a + bi',
        'a + b * i'
    ],
    'description':
        'A complex value a + bi, ' +
            'where a is the real part and b is the complex part, ' +
            'and i is the imaginary number defined as sqrt(-1).',
    'examples': [
        '2 + 3i',
        'sqrt(-4)',
        '(1.2 -5i) * 2'
    ],
    'seealso': [
        'abs',
        'arg',
        'conj',
        'im',
        're'
    ]
};
