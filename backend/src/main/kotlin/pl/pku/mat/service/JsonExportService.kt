package pl.pku.mat.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import org.springframework.stereotype.Service
import pl.pku.mat.dto.DeclarationResponse

@Service
class JsonExportService {

    private val objectMapper = ObjectMapper().apply {
        registerModule(JavaTimeModule())
        enable(SerializationFeature.INDENT_OUTPUT)
        disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
    }

    fun serialize(declaration: DeclarationResponse): String {
        return objectMapper.writeValueAsString(declaration)
    }
}
