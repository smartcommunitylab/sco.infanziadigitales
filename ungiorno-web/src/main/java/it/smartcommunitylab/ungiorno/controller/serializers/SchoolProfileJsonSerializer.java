package it.smartcommunitylab.ungiorno.controller.serializers;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import it.smartcommunitylab.ungiorno.model.SchoolProfile;

public class SchoolProfileJsonSerializer extends JsonSerializer<SchoolProfile> {

    @Override
    public void serialize(SchoolProfile obj, JsonGenerator generator, SerializerProvider provider)
            throws IOException, JsonProcessingException {
        generator.writeStartObject();
        generator.writeStringField("schoolId", obj.getSchoolId());
        generator.writeStringField("appId", obj.getAppId());
        generator.writeStringField("name", obj.getName());
        generator.writeStringField("address", obj.getAddress());
        generator.writeStringField("absenceTiming", obj.getAbsenceTiming());
        generator.writeStringField("retireTiming", obj.getRetireTiming());
        generator.writeStringField("accessEmail", obj.getAccessEmail());
        generator.writeObjectField("contacts", obj.getContacts());
        generator.writeObjectField("regularTiming", obj.getRegularTiming());
        generator.writeObjectField("anticipoTiming", obj.getAnticipoTiming());
        generator.writeObjectField("posticipoTiming", obj.getPosticipoTiming());
        generator.writeObjectField("absenceTypes", obj.getAbsenceTypes());
        generator.writeObjectField("frequentIllnesses", obj.getFrequentIllnesses());
        generator.writeObjectField("teacherNoteTypes", obj.getTeacherNoteTypes());
        generator.writeObjectField("foodTypes", obj.getFoodTypes());
        generator.writeObjectField("sections", obj.getSections());
        generator.writeObjectField("buses", obj.getBuses());
        generator.writeObjectField("timeSlotServices", obj.getTimeSlotServices());
        generator.writeEndObject();

    }

}
