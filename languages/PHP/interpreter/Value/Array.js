/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
define([
    'js/util',
    '../Reference/ArrayElement',
    '../Error',
    '../Error/Fatal',
    '../Value'
], function (
    util,
    ArrayElementReference,
    PHPError,
    PHPFatalError,
    Value
) {
    'use strict';

    var hasOwn = {}.hasOwnProperty;

    function ArrayValue(factory, value) {
        Value.call(this, factory, 'array', value);

        this.pointer = 0;
    }

    util.inherit(ArrayValue).from(Value);

    util.extend(ArrayValue.prototype, {
        clone: function () {
            var arrayValue,
                value = this;

            arrayValue = value.factory.createArray(value.value.slice());
            arrayValue.pointer = value.pointer;

            return arrayValue;
        },

        coerceToBoolean: function () {
            var value = this;

            return value.factory.createBoolean(value.value.length > 0);
        },

        coerceToInteger: function () {
            var value = this;

            return value.factory.createInteger(value.value.length === 0 ? 0 : 1);
        },

        coerceToKey: function (scopeChain) {
            scopeChain.raiseError(PHPError.E_WARNING, 'Illegal offset type');
        },

        coerceToNumber: function () {
            return this.coerceToInteger();
        },

        coerceToString: function () {
            return this.factory.createString('Array');
        },

        getNative: function () {
            var result = [];

            util.each(this.value, function (value) {
                result.push(value.get());
            });

            return result;
        },

        getCurrentElement: function () {
            var value = this;

            return value.value[value.pointer] || value.factory.createNull();
        },

        getCurrentElementReference: function () {
            var value = this;

            return new ArrayElementReference(value.value, value.pointer);
        },

        getElement: function (key, scopeChain) {
            var keyValue,
                value = this;

            key = key.coerceToKey(scopeChain);

            if (!key) {
                // Could not be coerced to a key: error will already have been handled, just return NULL
                return value.factory.createNull();
            }

            keyValue = key.get();

            if (!hasOwn.call(value.value, keyValue)) {
                scopeChain.raiseError(PHPError.E_NOTICE, 'Undefined offset: ' + keyValue);
                return value.factory.createNull();
            }

            return value.value[keyValue];
        },

        getKey: function () {
            var value = this;

            return value.factory.createInteger(value.pointer);
        },

        getLength: function () {
            var value = this;

            return value.factory.createInteger(value.value.length);
        },

        next: function () {
            this.pointer++;
        },

        onesComplement: function () {
            throw new PHPFatalError(PHPFatalError.UNSUPPORTED_OPERAND_TYPES);
        },

        reset: function () {
            this.pointer = 0;
        },

        setPointer: function (pointer) {
            this.pointer = pointer;
        },

        shiftLeftBy: function (rightValue) {
            return this.coerceToInteger().shiftLeftBy(rightValue);
        },

        shiftRightBy: function (rightValue) {
            return this.coerceToInteger().shiftRightBy(rightValue);
        }
    });

    return ArrayValue;
});
