type IFormatPair = {
    keys: string[];
    values: string[];
};

type IParsedText = {
    key: string;
    value: string;
};

type ISymbolForCheck = {
    isStr: boolean;
    checkedSymbols: string;
};

type IFormattedStrings = [string[]]

enum E_STYLE {
    MODIFIER = 'cdh-modifier',
    FUNCTION = 'cdh-function',
    FIELD = 'cdh-field',
    VAR = 'cdh-var',
    VAR_TXT = 'cdh-var_text',
    VAR_NUM = 'cdh-var_num',
    BRACES = 'cdh-braces',
    ANNOTATION = 'cdh-annotation',
    TAB = 'cdh-tab',
    THIS = 'cdh-this',
    PUNCTUATION = 'cdh-punctuation',
    COMMENT = 'cdh-comment',
    ROW = 'cdh-row'
}

const
    braces = '-+=/*<>(){}[]',
    text = '"\'`',
    numbers = '0123456789#',
    punctuation = '.,:;|!?&%',
    rows: Row[] = [],
    formattedText: IParsedText[] = [];

let separator = '~~',
    accumulatedChars = '',
    root: HTMLElement = <any>0,
    chars: string[] = <any>0;

class Row {
    public row = getHTMLRow();

    constructor(arg: string, format: string) {
        if (!!arg && !!format) {
            this.add(arg, format);
        }
    }

    executeSpan(style: string, str: string) {
        this.row.appendChild(getSpan(style, str));
    }

    md(str: string): Row { // modifier color
        this.executeSpan(E_STYLE.MODIFIER, str);
        return this;
    };

    fn(str: string): Row { // function color
        this.executeSpan(E_STYLE.FUNCTION, str);
        return this;
    };

    fd(str: string): Row { // variable color
        this.executeSpan(E_STYLE.FIELD, str);
        return this;
    };

    vr(str: string): Row { // variable color
        this.executeSpan(E_STYLE.VAR, str);
        return this;
    };

    vt(str: string): Row { // text color
        this.executeSpan(E_STYLE.VAR_TXT, str);
        return this;
    };

    vn(str: string): Row { // number color
        this.executeSpan(E_STYLE.VAR_NUM, str);
        return this;
    };

    br(str: string): Row { // braces color
        this.executeSpan(E_STYLE.BRACES, str);
        return this;
    };

    an(str: string): Row { // annotation color
        this.executeSpan(E_STYLE.ANNOTATION, str);
        return this;
    };

    ts(str: string): Row { // object color
        this.executeSpan(E_STYLE.THIS, str);
        return this;
    };

    pt(str: string): Row { // punctuation color
        this.executeSpan(E_STYLE.PUNCTUATION, str);
        return this;
    };

    ct(str: string): Row { // comment color
        this.executeSpan(E_STYLE.COMMENT, str);
        return this;
    };

    ns(str: string): Row { // without color
        this.executeSpan('', str);
        return this;
    };

    tb(): Row { // tabulation
        this.executeSpan(E_STYLE.TAB, '');
        return this;
    };

    block(arg: string, format: string): Row { // formatted from block
        const pair = split(arg, format);
        for (let i = 0; i < pair.values.length; i++) {
            const key: string = pair.keys[i];
            const str: string = pair.values[i];
            if (key) {
                // @ts-ignore
                this[key](str);
            } else {
                this['vt'](str);
            }
        }
        return this;
    };

    add(arg: string, format: string): Row { // formatted from group
        const pair = split(arg, format);
        for (let i = 0; i < pair.values.length; i++) {
            let resultKey = '';
            const key = pair.keys[i];
            const str = pair.values[i];
            if (key) {
                resultKey = key;
            } else {
                resultKey = 'vt';
            }
            formatBySymbols(str, resultKey);
            for (let j = 0; j < formattedText.length; j++) {
                let element = formattedText[j];
                // @ts-ignore
                this[element.key](element.value);
            }
        }
        return this;
    };
}

function clearRootInnerHtml(): void {
    if (root) {
        root.innerHTML = '';
    }
}

function getHTMLRow(): HTMLElement {
    const row = document.createElement('div');
    row.classList.add(E_STYLE.ROW);
    return row;
}

function getSpan(style: string, str: string): HTMLElement {
    const span = document.createElement('span');
    if (!!style) {
        span.classList.add(style);
    }
    span.innerHTML = str;
    return span;
}

function split(argument: string, format: string): IFormatPair {
    const pair: IFormatPair = {
        keys: format.split(' '),
        values: argument.split(separator)
    };

    const keys = [];

    for (let i = 0, k = 0; i < pair.values.length; i++) {
        const value = pair.values[i];
        if (!pair.keys[i]) {
            pair.keys.push('vt');
        }
        if (!!value && !!value.length) {
            const key = pair.keys[k++];
            keys.push(key);
        } else {
            keys.push('tb');
        }
    }

    pair.keys = keys;
    return pair;
}

function chkSym(symbol: string, str: string): boolean {
    for (let i = 0; i < str.length; i++) {
        if (str[i] === symbol) {
            return true;
        }
    }
    return false;
}

function deleteExtraSeparators(str: string): string {
    str = str.split(separator + separator).join('');
    const strArr: string[] = str.split(separator);
    if (strArr && strArr.length > 1 && !strArr[strArr.length - 1]) {
        strArr.pop();
    }
    if (strArr && strArr.length > 1 && !strArr[0]) {
        strArr.shift();
    }
    return strArr.join(separator);
}

function checkVtNs(str: string, command: string): number {
    let i = 0;
    if (command === 'vt') {
        const length = chars.length;
        i = length;
        for (; i > -1; --i) {
            if (chkSym(chars[i], text)) {
                i++;
                break;
            }
        }
        if (i <= 1) {
            i = length;
        }
        if (i <= length) {
            accumulatedChars = str.substr(0, i);
        }
    }
    if (command === 'ns') {
        i = length;
    }
    return i;
}

function fillFormatted(command: string, symbol: string, key: string): void {
    if (accumulatedChars) {
        formattedText.push({key: command, value: accumulatedChars});
    }
    formattedText.push({key: key, value: symbol});
    accumulatedChars = '';
}

function formatBySymbols(str: string, command: string): void {
    chars = str.split('');
    formattedText.length = 0;
    accumulatedChars = '';
    const length = chars.length;
    let i = checkVtNs(str, command);
    let symbol = '';

    function checkDuplicates(data: ISymbolForCheck) {
        let extraSymbol = '';
        let j = i + 1;
        for (; j < length; j++) {
            const tmpSymbol = chars[j];
            if (tmpSymbol === (data.isStr ? ' ' : '.')
                || chkSym(tmpSymbol, data.checkedSymbols)) {
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

    function checkText(checkedSymbol: string) {
        let extraSymbol = '';
        let j = i + 1;
        for (; j < length; j++) {
            const tmpSymbol = chars[j];
            extraSymbol += tmpSymbol;
            if (tmpSymbol === checkedSymbol && chars[j - 1] !== '\\') {
                break;
            }
        }
        if (!!extraSymbol) {
            i = j;
            symbol += extraSymbol;
        }
    }

    for (; i < length; i++) {
        symbol = chars[i];
        if (chkSym(symbol, text)) {
            checkText(symbol + '');
            fillFormatted(command, symbol, 'vt');
            continue;
        }
        if (chkSym(symbol, numbers)) {
            checkDuplicates({checkedSymbols: numbers, isStr: false});
            fillFormatted(command, symbol, 'vn');
            continue;
        }
        if (chkSym(symbol, braces)) {
            checkDuplicates({checkedSymbols: braces, isStr: true});
            fillFormatted(command, symbol, 'br');
            continue;
        }
        if (chkSym(symbol, punctuation)) {
            checkDuplicates({checkedSymbols: punctuation, isStr: true});
            fillFormatted(command, symbol, 'pt');
            continue;
        }
        accumulatedChars += symbol;
    }

    if (accumulatedChars) {
        formattedText.push({key: command, value: accumulatedChars});
    }

    if (!formattedText.length) {
        formattedText.push({key: command, value: str});
    }
}

function setRoot(rootId: string): void {
    root = <HTMLElement>document.getElementById(rootId);
    clearRootInnerHtml();
}

function setSep(str: string): void {
    separator = str;
}

function getSep(): string {
    return separator;
}

function setRows(arr: IFormattedStrings) {
    if (!!arr) {
        for (let i = 0; i < arr.length; i++) {
            const arg = arr[i][0];
            const key = arr[i][1];
            rows.push(getRow(arg, key));
        }
    }
    return rows;
}

function getRow(arg: string, format: string) {
    return new Row(arg, format);
}

function render(): void {
    clearRootInnerHtml();
    for (let i = 0; i < rows.length; i++) {
        if (root) {
            root.appendChild(rows[i].row);
        }
    }
    rows.length = 0;
}

// @ts-ignore
window.cdh_md = !!window.cdh_md ? window.cdh_md : {
    setRoot: setRoot, // set container ID
    setRows: setRows, // set code rows
    getRow: getRow, // get new code row
    render: render, // render formatted into container
    setSep: setSep, // if need set custom separator
    getSep: getSep, // get current separator
};
