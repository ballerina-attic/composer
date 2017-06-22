package org.ballerinalang.composer.service.workspace.langserver.suggetions;

import org.ballerinalang.composer.service.workspace.langserver.CompletionItemAccumulator;
import org.ballerinalang.composer.service.workspace.langserver.dto.CompletionItem;
import org.ballerinalang.composer.service.workspace.langserver.dto.Position;
import org.ballerinalang.composer.service.workspace.rest.datamodel.BFile;
import org.ballerinalang.model.BallerinaFile;
import org.ballerinalang.model.SymbolName;

import java.io.IOException;
import java.util.ArrayList;

/**
 * Tests for the auto complete suggester
 */
public class AutoCompleteSuggesterTest {

    public static void main(String[] args) throws IOException {
        BFile bFile = new BFile();
        bFile.setContent("@http:BasePath { value: \"/healthcare\"}\n" +
                "service Service1 {\n" +
                "\n" +
                "    @http:POST {}\n" +
                "    @http:Path { value: \"/reserve\"}\n" +
                "    resource Resource1 (message m) {\n" +
                "    \tint a = 12;\n" +
                "    \tint b = a\n" +
                "    }\n" +
                "}\n");
        bFile.setFilePath("/temp");
        bFile.setFileName("temp.bal");
        bFile.setPackageName(".");

        Position position = new Position();
        position.setLine(8);
        position.setCharacter(14);
        AutoCompleteSuggester autoCompleteSuggester = new AutoCompleteSuggesterImpl();
        CapturePossibleTokenStrategy capturePossibleTokenStrategy = new CapturePossibleTokenStrategy(position);
        BallerinaFile ballerinaFile = autoCompleteSuggester.getBallerinaFile(bFile, position, capturePossibleTokenStrategy);
        capturePossibleTokenStrategy.getSuggestionsFilterDataModel().setBallerinaFile(ballerinaFile);
        SuggestionsFilterDataModel dm = capturePossibleTokenStrategy.getSuggestionsFilterDataModel();



        ArrayList completionItem = new ArrayList<>();
        ArrayList<CompletionItem> completionItems = new ArrayList<>();
        CompletionItemAccumulator jsonModelBuilder = new CompletionItemAccumulator(completionItem, position);
        dm.getBallerinaFile().accept(jsonModelBuilder);

        for (Object symbol : completionItem) {
            if (symbol instanceof SymbolName) {
                CompletionItem completionItem1 = new CompletionItem();
                completionItem1.setLabel(((SymbolName) symbol).getName());
                completionItems.add(completionItem1);
            }
        }

        SuggestionsFilter suggestionsFilter = new SuggestionsFilter();
        suggestionsFilter.getCompletionItems(dm);
    }
}
