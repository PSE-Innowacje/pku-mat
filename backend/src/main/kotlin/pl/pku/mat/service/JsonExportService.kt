package pl.pku.mat.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import pl.pku.mat.dto.DeclarationResponse
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths

@Service
class JsonExportService(
    @Value("\${app.declarations.json-dir:./declarations-json}") private val jsonDir: String
) {

    private val objectMapper = ObjectMapper().apply {
        registerModule(JavaTimeModule())
        enable(SerializationFeature.INDENT_OUTPUT)
        disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
    }

    fun export(declaration: DeclarationResponse): String {
        val dir = Paths.get(jsonDir)
        Files.createDirectories(dir)

        val filename = declaration.declarationNumber.replace("/", "_") + ".json"
        val filePath = dir.resolve(filename)

        objectMapper.writeValue(filePath.toFile(), declaration)
        return filePath.toString()
    }
}
