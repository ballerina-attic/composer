package org.ballerinalang.composer.service.workspace.langserver.suggetions;

import org.ballerinalang.composer.service.workspace.langserver.dto.Position;
import org.ballerinalang.composer.service.workspace.rest.datamodel.BFile;

import java.io.IOException;

/**
 * Tests for the auto complete suggester
 */
public class AutoCompleteSuggesterTest {

    public static void main(String[] args) throws IOException {
        BFile bFile = new BFile();
        bFile.setContent("function hello () {\n" +
                "\ttry \n" +
                "}");
        bFile.setFilePath("/temp");
        bFile.setFileName("temp.bal");
        bFile.setPackageName(".");

        Position position = new Position();
        position.setLine(2);
        position.setCharacter(6);
        AutoCompleteSuggester autoCompleteSuggester = new AutoCompleteSuggesterImpl();
        SuggestionsFilterDataModel dm = autoCompleteSuggester.getSuggestionFilterDataModel(bFile, position);
        SuggestionsFilter suggestionsFilter = new SuggestionsFilter();
        suggestionsFilter.filterSuggestionCriteria(dm);
    }
}
