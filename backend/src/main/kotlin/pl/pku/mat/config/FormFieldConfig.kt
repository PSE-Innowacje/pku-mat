package pl.pku.mat.config

import pl.pku.mat.dto.FormFieldDef

object FormFieldDefinitions {

    private val OP_OSDP = listOf(
        FormFieldDef("IGDSUM", "Liczba odbiorcow koncowych w gospodarstwach domowych (suma 1.1-1.3)", "NUMBER", 0, "szt"),
        FormFieldDef("IGD1i", "Zuzycie < 500 kWh rocznie", "NUMBER", 0, "szt"),
        FormFieldDef("IGD2i", "Zuzycie 500-1200 kWh rocznie", "NUMBER", 0, "szt"),
        FormFieldDef("IGD3i", "Zuzycie > 1200 kWh rocznie", "NUMBER", 0, "szt"),
        FormFieldDef("OPSUM", "Suma mocy umownych odbiorcow koncowych (suma 2.1-2.4)", "NUMBER", 3, "kW"),
        FormFieldDef("PnNi", "Przylaczeni do sieci nN kontrahenta", "NUMBER", 3, "kW"),
        FormFieldDef("PSNi", "Przylaczeni do sieci SN kontrahenta", "NUMBER", 3, "kW"),
        FormFieldDef("PWN", "Przylaczeni do sieci WN/NN kontrahenta", "NUMBER", 3, "kW"),
        FormFieldDef("Posi", "Odbiorcy >= 400 GWh, >= 60% mocy umownej, koszt EE >= 15% produkcji", "NUMBER", 3, "kW"),
    )

    private val OZE_OSDP = listOf(
        FormFieldDef("OZESUM", "Wielkosc srodkow z tytulu oplaty OZE (1.1 - 1.2)", "NUMBER", 2, "zl"),
        FormFieldDef("OZEN", "Wielkosc naleznych srodkow z tytulu oplaty OZE", "NUMBER", 2, "zl"),
        FormFieldDef("OZEPN", "Wierzytelnosci niesciagalne z poprzednich okresow", "NUMBER", 2, "zl"),
        FormFieldDef("OZEE", "Ilosc energii - podstawa naliczania oplaty OZE", "NUMBER", 3, "MWh"),
    )

    private val OZE_WYTWORCA = listOf(
        FormFieldDef("OZEil", "Planowana ilosc energii - podstawa naliczania oplaty OZE", "NUMBER", 3, "MWh"),
    )

    fun getFields(feeTypeCode: String, contractorTypeCode: String): List<FormFieldDef> = when {
        feeTypeCode == "OP" && contractorTypeCode == "OSDp" -> OP_OSDP
        feeTypeCode == "OZE" && contractorTypeCode == "OSDp" -> OZE_OSDP
        feeTypeCode == "OZE" && contractorTypeCode == "WYTWORCA" -> OZE_WYTWORCA
        else -> throw IllegalArgumentException("Brak definicji formularza dla $feeTypeCode / $contractorTypeCode")
    }

    @Suppress("UNUSED_PARAMETER")
    fun isCommentAllowed(feeTypeCode: String, contractorTypeCode: String): Boolean = true
}
