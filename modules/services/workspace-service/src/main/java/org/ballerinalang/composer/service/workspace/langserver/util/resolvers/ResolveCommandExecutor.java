package org.ballerinalang.composer.service.workspace.langserver.util.resolvers;

import org.ballerinalang.composer.service.workspace.langserver.consts.LangServerConstants;
import org.ballerinalang.composer.service.workspace.langserver.dto.CompletionItem;
import org.ballerinalang.composer.service.workspace.langserver.suggetions.SuggestionsFilterDataModel;

import java.util.ArrayList;
import java.util.HashMap;

/**
 * ResolveCommandExecutor will accept the command to execute
 */
public class ResolveCommandExecutor {
    private static final HashMap<Integer, ItemResolver> resolvers = new HashMap<>();

    public ResolveCommandExecutor() {
        FunctionsResolver functionsResolver = new FunctionsResolver();
        resolvers.put(LangServerConstants.FUNCTION_INVOCATION_CRITERIA, functionsResolver);
    }

    /**
     * Resolve the completion items based on the criteria
     * @param resolveCriteria - resolving criteria
     * @param dataModel - SuggestionsFilterDataModel
     * @return {@link ArrayList}
     */
    public ArrayList<CompletionItem> resolveCompletionItems (int resolveCriteria,
                                                             SuggestionsFilterDataModel dataModel) {
        return resolvers.get(resolveCriteria).resolveItems(dataModel);
    }
}
