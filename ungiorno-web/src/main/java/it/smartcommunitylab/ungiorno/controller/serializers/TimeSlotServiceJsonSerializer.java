package it.smartcommunitylab.ungiorno.controller.serializers;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import it.smartcommunitylab.ungiorno.model.TimeSlotSchoolService;

public class TimeSlotServiceJsonSerializer extends JsonSerializer<TimeSlotSchoolService> {

    @Override
    public void serialize(TimeSlotSchoolService obj, JsonGenerator generator,
            SerializerProvider provider) throws IOException, JsonProcessingException {

        generator.writeStartObject();
        generator.writeStringField("name", obj.getName());
        generator.writeBooleanField("regular", obj.isRegular());
        generator.writeBooleanField("enabled", obj.isEnabled());
        generator.writeStringField("note", obj.getNote());
        generator.writeObjectField("timeSlots", obj.getTimeSlots());
        generator.writeEndObject();
    }

}
