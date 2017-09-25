package it.smartcommunitylab.ungiorno.model;

import java.util.List;

import org.joda.time.DateTime;
import org.junit.Assert;
import org.junit.Test;

import it.smartcommunitylab.ungiorno.model.TimeSlotSchoolService.ServiceTimeSlot;

public class TimeSlotSchoolServiceTest {

    @Test(expected = IllegalArgumentException.class)
    public void nameIsNull() {
        new TimeSlotSchoolService(null, false);
    }

    @Test
    public void addingFirstTimeSlot() {
        TimeSlotSchoolService service = new TimeSlotSchoolService("service", false);
        List<ServiceTimeSlot> slots =
                service.addTimeSlot("slot1", new DateTime(), new DateTime().plusHours(1));
        Assert.assertEquals(1, slots.size());
    }

    @Test
    public void addingTimeSlotToNotEmptySet() {
        TimeSlotSchoolService service = new TimeSlotSchoolService("service", false);
        List<ServiceTimeSlot> slots =
                service.addTimeSlot("slot1", new DateTime(), new DateTime().plusHours(1));

        slots = service.addTimeSlot("slot2", new DateTime(), new DateTime().plusHours(2));
        Assert.assertEquals(2, slots.size());
        Assert.assertEquals(slots.get(1).getName(), "slot2");
    }
}
