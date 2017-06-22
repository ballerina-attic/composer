package org.ballerinalang.composer.service.workspace.langserver.util.resolvers;

import org.antlr.v4.runtime.ParserRuleContext;
import org.antlr.v4.runtime.TokenStream;
import org.ballerinalang.composer.service.workspace.langserver.SymbolInfo;
import org.ballerinalang.composer.service.workspace.langserver.dto.CompletionItem;
import org.ballerinalang.composer.service.workspace.langserver.suggetions.PossibleToken;
import org.ballerinalang.composer.service.workspace.langserver.suggetions.SuggestionsFilterDataModel;
import org.ballerinalang.model.BLangPackage;
import org.ballerinalang.model.NativeUnit;
import org.ballerinalang.model.SymbolName;
import org.ballerinalang.model.symbols.BLangSymbol;
import org.ballerinalang.natives.NativePackageProxy;
import org.ballerinalang.natives.NativeUnitProxy;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Variable definition Statement context resolver for resolving the items of the statement context
 */
public class VariableDefinitionStatementContextResolver implements ItemResolver {
    @Override
    public ArrayList<CompletionItem> resolveItems(SuggestionsFilterDataModel dataModel, ArrayList<SymbolInfo> symbols) {
        // We need to Calculate from which level of the symbol table. Decide the level by considering
        // the number of : and the . from the current token and search is terminated when an endline met

        ArrayList<CompletionItem> completionItems = new ArrayList<>();
        int currentTokenIndex = dataModel.getTokenIndex();
        int searchLevel = 0;
        ArrayList<String> searchTokens = new ArrayList<>();
        TokenStream tokenStream = dataModel.getTokenStream();
        boolean continueSearch = true;
        int searchTokenIndex = currentTokenIndex + 1;

        while (continueSearch) {
            String tokenStr = tokenStream.get(searchTokenIndex).getText();
            if (tokenStr.equals(":") || tokenStr.equals(".")) {
                searchTokens.add(tokenStream.get(searchTokenIndex - 1).getText());
                searchLevel++;
            } else if (tokenStr.equals("\n")) {
                continueSearch = false;
            }
            searchTokenIndex++;
        }

        ArrayList<SymbolInfo> searchList = symbols;

        for (int itr = 0; itr < searchLevel; itr++) {
            String searchStr = searchTokens.get(itr);
            List<SymbolInfo> filteredSymbolInfoList = searchList.stream()
                    .filter(
                            symbolInfo -> symbolInfo.getSymbolName().contains(searchStr)
                                    && (symbolInfo.getSymbol() instanceof NativePackageProxy
                                    || symbolInfo.getSymbol() instanceof NativeUnitProxy)
                    ).collect(Collectors.toList());

            searchList.clear();
            for (int filterItr = 0; filterItr < filteredSymbolInfoList.size(); filterItr ++) {
                if (filteredSymbolInfoList.get(filterItr).getSymbol() instanceof NativePackageProxy) {
                    BLangPackage bLangPackage =
                            ((NativePackageProxy)filteredSymbolInfoList.get(filterItr).getSymbol()).load();
                    bLangPackage.getSymbolMap().forEach((k,v) -> {
                        SymbolInfo symbolInfo = new SymbolInfo(k.getName(), v);
                        searchList.add(symbolInfo);
                    });
                } else if(filteredSymbolInfoList.get(filterItr).getSymbol() instanceof NativeUnitProxy) {
                    NativeUnit nativeUnit = ((NativeUnitProxy)filteredSymbolInfoList.get(filterItr).getSymbol()).load();
                    SymbolInfo symbolInfo = new SymbolInfo(((BLangSymbol)nativeUnit).getName(),
                            ((BLangSymbol)nativeUnit));
                    searchList.add(symbolInfo);
                }


            }
        }

        searchList.forEach((symbolInfo -> {
            // For each token call the api to get the items related to the token
            CompletionItem completionItem = new CompletionItem();
            completionItem.setLabel(symbolInfo.getSymbolName());
            completionItems.add(completionItem);
        }));
        return completionItems;
    }
}
