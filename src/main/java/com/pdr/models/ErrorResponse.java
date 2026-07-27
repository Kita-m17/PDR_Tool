/*
 * File: ErrorResponse.java
 * Package: com.pdr.models
 *
 * Original Author: Thabo Vincent Moloi , Honours Project (2024), University of Cape Town
 
 * Status: Reused unchanged in this project.
 * Context: Developed for PDR's project.
 * Purpose: Educational use only.
 */
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
