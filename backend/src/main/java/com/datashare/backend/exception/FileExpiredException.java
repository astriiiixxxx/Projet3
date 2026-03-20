package com.datashare.backend.exception;

public class FileExpiredException extends RuntimeException {
    public FileExpiredException(String message) {
        super(message);
    }
}