package org.ballerinalang.composer.service.workspace.langserver.util.resolvers;

import org.ballerinalang.composer.service.workspace.langserver.dto.CompletionItem;
import org.ballerinalang.composer.service.workspace.langserver.suggetions.SuggestionsFilterDataModel;
import org.ballerinalang.util.parser.BallerinaParser;

import java.util.ArrayList;
import java.util.HashMap;

/**
 * ResolveCommandExecutor will accept the command to execute
 */
public class ResolveCommandExecutor {
    private static final HashMap<Class, ItemResolver> resolvers = new HashMap<>();

    public ResolveCommandExecutor() {
        StatementContextResolver statementContextResolver = new StatementContextResolver();
        VariableDefinitionStatementContextResolver variableDefinitionStatementContextResolver =
                new VariableDefinitionStatementContextResolver();
        resolvers.put(BallerinaParser.StatementContext.class, statementContextResolver);
        resolvers.put(BallerinaParser.VariableDefinitionStatementContext.class,
                variableDefinitionStatementContextResolver);
    }

    /**
     * Resolve the completion items based on the criteria
     * @param resolveCriteria - resolving criteria
     * @param dataModel - SuggestionsFilterDataModel
     * @return {@link ArrayList}
     */
    public ArrayList<CompletionItem> resolveCompletionItems (Class resolveCriteria,
                                                             SuggestionsFilterDataModel dataModel) {
        return resolvers.get(resolveCriteria).resolveItems(dataModel);
    }
}
