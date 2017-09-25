package it.smartcommunitylab.ungiorno.controller.serializers;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import it.smartcommunitylab.ungiorno.model.TimeSlotSchoolService;

public class TimeSlotServiceJsonSerializer extends JsonSerializer<TimeSlotSchoolService> {

    @Override
    public void serialize(TimeSlotSchoolService arg0, JsonGenerator arg1, SerializerProvider arg2)
            throws IOException, JsonProcessingException {

    }

}
