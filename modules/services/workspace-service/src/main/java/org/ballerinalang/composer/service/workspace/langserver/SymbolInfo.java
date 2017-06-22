package org.ballerinalang.composer.service.workspace.langserver;

import org.ballerinalang.model.symbols.BLangSymbol;

/**
 * Created by nadeeshaan on 6/22/17.
 */
public class SymbolInfo {
    private String symbolName;
    private BLangSymbol symbol;

    public SymbolInfo(String symbolName, BLangSymbol symbol) {
        this.symbolName = symbolName;
        this.symbol = symbol;
    }

    public String getSymbolName() {
        return symbolName;
    }

    public void setSymbolName(String symbolName) {
        this.symbolName = symbolName;
    }

    public BLangSymbol getSymbol() {
        return symbol;
    }

    public void setSymbol(BLangSymbol symbol) {
        this.symbol = symbol;
    }
}
