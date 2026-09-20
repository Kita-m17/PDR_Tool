package com.pdr.dtos;

import lombok.Data;

/**
 * Contains Query and KnowledgeBase
 */
@Data
public class InputDTO {
    KnowledgeBaseDTO knowledgeBaseDTO;
    QueryDTO queryDTO;
}
