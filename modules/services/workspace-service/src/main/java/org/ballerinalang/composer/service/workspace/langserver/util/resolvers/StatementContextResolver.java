package org.ballerinalang.composer.service.workspace.langserver.util.resolvers;

import org.ballerinalang.composer.service.workspace.langserver.dto.CompletionItem;
import org.ballerinalang.composer.service.workspace.langserver.suggetions.PossibleToken;
import org.ballerinalang.composer.service.workspace.langserver.suggetions.SuggestionsFilterDataModel;

import java.util.ArrayList;
import java.util.List;

/**
 * Statement context resolver for resolving the items of the statement context
 */
public class StatementContextResolver implements ItemResolver {
    @Override
    public ArrayList<CompletionItem> resolveItems(SuggestionsFilterDataModel dataModel) {
//        ParserRuleContext currentContext = dataModel.getContext();
        List<PossibleToken> possibleTokens = dataModel.getPossibleTokens();
        ArrayList<CompletionItem> completionItems = new ArrayList<>();

        for (PossibleToken token : possibleTokens) {
            // For each token call the api to get the items related to the token
            CompletionItem completionItem = new CompletionItem();
            completionItem.setLabel(token.getTokenName());
            completionItems.add(completionItem);
        }
        return completionItems;
    }
}
