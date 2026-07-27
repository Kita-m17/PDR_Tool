package com.pdr.models;

public class ErrorResponse {
    public final int code;
    public final String description;
    public final String message;

    public ErrorResponse(int code, String description, String message){
        this.code = code;
        this.description = description;
        this.message = message;
    }
}
