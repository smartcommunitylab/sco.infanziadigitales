package it.smartcommunitylab.ungiorno.controller.serializers;

import java.io.IOException;

import org.joda.time.DateTime;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;

import it.smartcommunitylab.ungiorno.model.TimeSlotSchoolService;

public class TimeSlotServiceJsonDeserializer extends JsonDeserializer<TimeSlotSchoolService> {

    @Override
    public TimeSlotSchoolService deserialize(JsonParser parser, DeserializationContext deserializer)
            throws IOException, JsonProcessingException {
        JsonNode node = parser.getCodec().readTree(parser);
        String name = node.get("name") != null ? node.get("name").asText() : null;
        boolean regular = node.get("regular") != null ? node.get("regular").asBoolean() : false;
        TimeSlotSchoolService service = new TimeSlotSchoolService(name, regular);
        boolean enabled = node.get("enabled") != null ? node.get("enabled").asBoolean() : false;
        String note = node.get("note") != null ? node.get("note").asText() : null;
        service.setEnabled(enabled);
        service.setNote(note);
        JsonNode timeSlots = node.get("timeSlots");
        if (timeSlots != null && timeSlots.isArray()) {
            for (JsonNode slot : timeSlots) {
                String slotName = slot.get("name") != null ? slot.get("name").asText() : null;
                String fromTimeIsoString =
                        slot.get("fromTime") != null ? slot.get("fromTime").asText() : null;
                String toTimeIsoString =
                        slot.get("toTime") != null ? slot.get("toTime").asText() : null;
                DateTime fromTime = null;
                DateTime toTime = null;
                if (fromTimeIsoString != null) {
                    fromTime = DateTime.parse(fromTimeIsoString);
                }
                if (toTimeIsoString != null) {
                    toTime = DateTime.parse(toTimeIsoString);
                }
                service.addTimeSlot(slotName, fromTime, toTime);
            }
        }
        return service;
    }

}
