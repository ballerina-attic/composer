package org.ballerinalang.composer.service.workspace.langserver.util.resolvers;

import org.ballerinalang.composer.service.workspace.langserver.SymbolInfo;
import org.ballerinalang.composer.service.workspace.langserver.consts.SymbolKind;
import org.ballerinalang.composer.service.workspace.langserver.dto.CompletionItem;
import org.ballerinalang.composer.service.workspace.langserver.suggetions.SuggestionsFilterDataModel;
import org.ballerinalang.composer.service.workspace.langserver.util.PackageItemResolver;
import org.ballerinalang.composer.service.workspace.model.Function;
import org.ballerinalang.model.SymbolName;

import java.util.ArrayList;
import java.util.List;

/**
 * Resolves the functions in a package
 */
public class FunctionsResolver implements ItemResolver {
    @Override
    public ArrayList<CompletionItem> resolveItems(SuggestionsFilterDataModel dataModel, ArrayList<SymbolInfo> symbols) {
        String packageName = dataModel.getContext().getStart().getText();
        PackageItemResolver packageItemResolver = PackageItemResolver.getInstance();
        List<Function> functions = packageItemResolver.getFunctionInvocations(packageName);
        ArrayList<CompletionItem> completionItems = new ArrayList<>();

        functions.forEach(function -> {
            CompletionItem item = new CompletionItem();
            item.setLabel(function.getName());
            item.setDetail(function.getDescription());
            item.setKind(SymbolKind.FUNCTION_DEF);
            completionItems.add(item);
        });

        return completionItems;
    }
}
