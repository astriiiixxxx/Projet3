package com.datashare.backend.exception;

public class InvalidFilePasswordException extends RuntimeException {

    public InvalidFilePasswordException(String message) {
        super(message);
    }
}