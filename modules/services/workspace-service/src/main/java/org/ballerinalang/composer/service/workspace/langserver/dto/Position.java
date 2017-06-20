package org.ballerinalang.composer.service.workspace.langserver.dto;

/**
 * DTO to represent the position inside a document
 */
public class Position {
    private int line;

    private int character;

    public int getLine() {
        return line;
    }

    public void setLine(int line) {
        this.line = line;
    }

    public int getCharacter() {
        return character;
    }

    public void setCharacter(int character) {
        this.character = character;
    }

    @Override
    public int hashCode() {
        return ("L:" + line + ",COL:" + character).hashCode();
    }

    public boolean equals(Object obj) {
        if (obj instanceof Position) {
            Position other = (Position) obj;
            return (other.getLine() == this.getLine()) && (other.getCharacter() == this.getCharacter());
        } else {
            return false;
        }
    }
}
