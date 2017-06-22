package org.ballerinalang.composer.service.workspace.langserver.util.resolvers;

import org.ballerinalang.composer.service.workspace.langserver.SymbolInfo;
import org.ballerinalang.composer.service.workspace.langserver.dto.CompletionItem;
import org.ballerinalang.composer.service.workspace.langserver.suggetions.SuggestionsFilterDataModel;
import org.ballerinalang.model.SymbolName;

import java.util.ArrayList;

/**
 * Interface for completion item resolvers
 */
public interface ItemResolver {
    ArrayList<CompletionItem> resolveItems(SuggestionsFilterDataModel dataModel, ArrayList<SymbolInfo> symbols);
}
