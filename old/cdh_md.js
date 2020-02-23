// EXAMPLES FOR USE
//
// EX1:
//
// cdh_md.setRoot('cdh_root1');
// cdh_md.setRows().push(
//     cdh_md.getRow().an('@Hello world'),
//     cdh_md.getRow().add('getColor ~~( str ){ ~~var ~~z = "test" + str + 15.5; }', 'fn vr md vr'),
//     cdh_md.getRow().block('getColor ~~(~~ str ~~){ ~~var ~~z ~~= ~~"test" ~~+ ~~str~~ + ~~15.5~~;~~ }', 'fn br vr br md vr pt vt pt vr pt vn pt br'),
//     cdh_md.getRow().fn('getColor ').br('( ').vr(' str ').br(' )').br('{').md(' var ').vr('z').pt(' = ').vt('"test"').pt(' + ').vr('str').pt(' + ').vn('15.5').pt(';').br(' }')
// );
// cdh_md.render();
//
//
// EX2:
//
// cdh_md.setRoot('cdh_root5');
// cdh_md.setRows().push(
//     cdh_md.getRow().ct('// This is an experimental code format library'),
//     cdh_md.getRow().an('@Hello world'),
//     cdh_md.getRow().add('function~~ getColor (~~ str, "text\\"`" ){', 'md fn vr'),
//     cdh_md.getRow().tb().add('var~~ z = 10.5;', 'md vr'),
//     cdh_md.getRow().tb().add('var~~ tmp != str, x = 21, z = "test1";', 'md vr'),
//     cdh_md.getRow().tb().add('tmp += z;', 'vr'),
//     cdh_md.getRow().tb().add('str = "txt";', 'vr'),
//     cdh_md.getRow().br('}'),
//     cdh_md.getRow().tb(),
//     cdh_md.getRow().add('&lt;script src="cdh_md.js"&gt;&lt;/script&gt;', 'vr'),
//     cdh_md.getRow().pt('&lt;').group('script src="cdh_md.js"', 'vr').pt('&gt;').vt('&lt;').vr('/script').pt('&gt;'),
//     cdh_md.getRow().block('&lt;~~script src="cdh_md.js"~~&gt;&lt;~~/script~~&gt;', 'pt vr pt vr pt'),
//     cdh_md.getRow().tb(),
//     cdh_md.getRow().ns('12313a lorem ').group('Math.~~sin~~( x )', 'ts fn vr').ns(' 12313a lorem')
// );
// cdh_md.render();

(function () {
    var cdh_md = {};
    cdh_md.sep = '~~';
    cdh_md._style = {
        MODIFIER: 'cdh-modifier',
        FUNCTION: 'cdh-function',
        FIELD: 'cdh-field',
        VAR: 'cdh-var',
        VAR_TXT: 'cdh-var_text',
        VAR_NUM: 'cdh-var_num',
        BRACES: 'cdh-braces',
        ANNOTATION: 'cdh-annotation',
        TAB: 'cdh-tab',
        THIS: 'cdh-this',
        PUNCTUATION: 'cdh-punctuation',
        COMMENT: 'cdh-comment',
        ROW: 'cdh-row'
    };
    cdh_md._braces = '-+=/*<>(){}[]';
    cdh_md._text = '"\'`';
    cdh_md._numbers = '0123456789#';
    cdh_md._punctuation = '.,:;|!?&%';

    cdh_md.rows = [];
    cdh_md._root = null;
    cdh_md._chars = null;
    cdh_md._accomulatedChars = '';
    cdh_md._formattedText = [];
    cdh_md.Row = function (arg, format) {
        this.row = cdh_md._getRow();
        this.executeSpan = function (style, str) {
            this.row.appendChild(cdh_md._getSpan(style, str));
        };
        this.md = function (str) { // modifier color
            this.executeSpan(cdh_md._style.MODIFIER, str);
            return this;
        };
        this.fn = function (str) { // function color
            this.executeSpan(cdh_md._style.FUNCTION, str);
            return this;
        };
        this.fd = function (str) { // variable color
            this.executeSpan(cdh_md._style.FIELD, str);
            return this;
        };
        this.vr = function (str) { // variable color
            this.executeSpan(cdh_md._style.VAR, str);
            return this;
        };
        this.vt = function (str) { // text color
            this.executeSpan(cdh_md._style.VAR_TXT, str);
            return this;
        };
        this.vn = function (str) { // number color
            this.executeSpan(cdh_md._style.VAR_NUM, str);
            return this;
        };
        this.br = function (str) { // braces color
            this.executeSpan(cdh_md._style.BRACES, str);
            return this;
        };
        this.an = function (str) { // annotation color
            this.executeSpan(cdh_md._style.ANNOTATION, str);
            return this;
        };
        this.ts = function (str) { // object color
            this.executeSpan(cdh_md._style.THIS, str);
            return this;
        };
        this.pt = function (str) { // punctuation color
            this.executeSpan(cdh_md._style.PUNCTUATION, str);
            return this;
        };
        this.ct = function (str) { // comment color
            this.executeSpan(cdh_md._style.COMMENT, str);
            return this;
        };
        this.ns = function (str) { // without color
            this.executeSpan('', str);
            return this;
        };
        this.tb = function () { // tabulation
            this.executeSpan(cdh_md._style.TAB, '');
            return this;
        };
        this.block = function (arg, format) { // formatted from block
            var pair = cdh_md._split(arg, format);
            for (let i = 0; i < pair.values.length; i++) {
                var key = pair.keys[i];
                var str = pair.values[i];
                if (key) {
                    this[key](str);
                } else {
                    this['vt'](str);
                }
            }
            return this;
        };
        this.add = function (arg, format) { // formatted from group
            var pair = cdh_md._split(arg, format);
            for (let i = 0; i < pair.values.length; i++) {
                var resultKey = '';
                var key = pair.keys[i];
                var str = pair.values[i];
                if (key) {
                    resultKey = key;
                } else {
                    resultKey = 'vt';
                }
                cdh_md._formatBySymbols(str, resultKey);
                for (let j = 0; j < cdh_md._formattedText.length; j++) {
                    let element = cdh_md._formattedText[j];
                    this[element.key](element.value);
                }
            }
            return this;
        };

        if (!!arg && !!format) {
            this.add(arg, format);
        }
    };

    cdh_md._clearRootInnerHtml = function () {
        if (cdh_md._root) {
            cdh_md._root.innerHTML = '';
        }
    };
    cdh_md._getRow = function () {
        var row = document.createElement('div');
        row.classList.add(cdh_md._style.ROW);
        return row;
    };
    cdh_md._getSpan = function (style, str) {
        var span = document.createElement('span');
        if (!!style) {
            span.classList.add(style);
        }
        span.innerHTML = str;
        return span;
    };
    cdh_md._split = function (argument, format) {
        var pair = {
            keys: format.split(' '),
            values: argument.split(cdh_md.sep)
        };

        var keys = [];

        for (var i = 0, k = 0; i < pair.values.length; i++) {
            var value = pair.values[i];
            if (!pair.keys[i]) {
                pair.keys.push('vt');
            }
            if (!!value && !!value.length) {
                var key = pair.keys[k++];
                keys.push(key);
            } else {
                keys.push('tb');
            }
        }

        pair.keys = keys;
        return pair;
    };
    cdh_md._chkSym = function (symbol, str) {
        for (let i = 0; i < str.length; i++) {
            if (str[i] === symbol) {
                return true;
            }
        }
        return false;
    };
    cdh_md._deleteExtraSeparators = function (str) {
        str = str.split(cdh_md.sep + cdh_md.sep).join('');
        str = str.split(cdh_md.sep);
        if (str && str.length > 1 && !str[str.length - 1]) {
            str.pop();
        }
        if (str && str.length > 1 && !str[0]) {
            str.shift();
        }
        return str.join(cdh_md.sep);
    };

    cdh_md._checkVtNs = function (str, command) {
        var i = 0;
        if (command === 'vt') {
            var length = cdh_md._chars.length;
            i = length;
            for (; i > -1; --i) {
                if (cdh_md._chkSym(cdh_md._chars[i], cdh_md._text)) {
                    i++;
                    break;
                }
            }
            if (i <= 1) {
                i = length;
            }
            if (i <= length) {
                cdh_md._accomulatedChars = str.substr(0, i);
            }
        }
        if (command === 'ns') {
            i = length;
        }
        return i;
    };

    cdh_md._fillFormatted = function (command, symbol, key) {
        if (cdh_md._accomulatedChars) {
            cdh_md._formattedText.push({key: command, value: cdh_md._accomulatedChars});
        }
        cdh_md._formattedText.push({key: key, value: symbol});
        cdh_md._accomulatedChars = '';
    };

    cdh_md._formatBySymbols = function (str, command) {
        cdh_md._chars = str.split('');
        cdh_md._formattedText.length = 0;
        cdh_md._accomulatedChars = '';
        var length = cdh_md._chars.length;
        var i = cdh_md._checkVtNs(str, command);

        function checkDuplicates(data) {
            var extraSymbol = '';
            let j = i + 1;
            for (; j < length; j++) {
                var tmpSymbol = cdh_md._chars[j];
                if (tmpSymbol === (data.isStr ? ' ' : '.')
                    || cdh_md._chkSym(tmpSymbol, data.checkedSymbols)) {
                    extraSymbol += tmpSymbol;
                } else {
                    break;
                }
            }
            if (!!extraSymbol) {
                i = j - 1;
                symbol += extraSymbol;
            }
        }

        function checkText(checkedSymbol) {
            var extraSymbol = '';
            let j = i + 1;
            for (; j < length; j++) {
                var tmpSymbol = cdh_md._chars[j];
                extraSymbol += tmpSymbol;
                if (tmpSymbol === checkedSymbol && cdh_md._chars[j - 1] !== '\\') {
                    break;
                }
            }
            if (!!extraSymbol) {
                i = j;
                symbol += extraSymbol;
            }
        }

        for (; i < length; i++) {
            var symbol = cdh_md._chars[i];
            if (cdh_md._chkSym(symbol, cdh_md._text)) {
                checkText(symbol + '');
                cdh_md._fillFormatted(command, symbol, 'vt');
                continue;
            }
            if (cdh_md._chkSym(symbol, cdh_md._numbers)) {
                checkDuplicates({checkedSymbols: cdh_md._numbers, isStr: false});
                cdh_md._fillFormatted(command, symbol, 'vn');
                continue;
            }
            if (cdh_md._chkSym(symbol, cdh_md._braces)) {
                checkDuplicates({checkedSymbols: cdh_md._braces, isStr: true});
                cdh_md._fillFormatted(command, symbol, 'br');
                continue;
            }
            if (cdh_md._chkSym(symbol, cdh_md._punctuation)) {
                checkDuplicates({checkedSymbols: cdh_md._punctuation, isStr: true});
                cdh_md._fillFormatted(command, symbol, 'pt');
                continue;
            }
            cdh_md._accomulatedChars += symbol;
        }

        if (cdh_md._accomulatedChars) {
            cdh_md._formattedText.push({key: command, value: cdh_md._accomulatedChars});
        }

        if (!cdh_md._formattedText.length) {
            cdh_md._formattedText.push({key: command, value: str});
        }
    };

    cdh_md.setRoot = function (rootId) {
        cdh_md._root = document.getElementById(rootId);
        cdh_md._clearRootInnerHtml();
    };
    cdh_md.setSep = function (str) {
        cdh_md.sep = str;
    };
    cdh_md.getSep = function () {
        return cdh_md.sep;
    };
    cdh_md.setRows = function (arr) {
        if (!!arr) {
            for (var i = 0; i < arr.length; i++) {
                var arg = arr[i][0];
                var key = arr[i][1];
                cdh_md.rows.push(cdh_md.getRow(arg, key));
            }
        }
        return cdh_md.rows;
    };
    cdh_md.getRow = function (arg, format) {
        return new cdh_md.Row(arg, format);
    };
    cdh_md.render = function () {
        cdh_md._clearRootInnerHtml();
        for (let i = 0; i < cdh_md.rows.length; i++) {
            if (cdh_md._root) {
                cdh_md._root.appendChild(cdh_md.rows[i].row);
            }
        }
        cdh_md.rows.length = 0;
    };

    window.cdh_md = !!window.cdh_md ? window.cdh_md : {
        setRoot: cdh_md.setRoot, // set container ID
        setRows: cdh_md.setRows, // set code rows
        getRow: cdh_md.getRow, // get new code row
        render: cdh_md.render, // render formatted into container
        setSep: cdh_md.setSep, // if need set custom separator
        getSep: cdh_md.getSep, // get current separator
    };
})();
