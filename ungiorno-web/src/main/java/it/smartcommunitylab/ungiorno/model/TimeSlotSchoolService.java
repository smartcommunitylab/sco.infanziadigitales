package it.smartcommunitylab.ungiorno.model;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import javax.annotation.Nonnull;

import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;

import com.google.common.base.MoreObjects;
import com.google.common.collect.ImmutableList;

public class TimeSlotSchoolService extends SchoolService {
    private final String name;
    private Set<ServiceTimeSlot> timeSlots = new LinkedHashSet<>();
    private final boolean regular;

    public static final String DEFAULT_REGULAR_SERVICE_NAME = "Normale";

    public TimeSlotSchoolService(@Nonnull String name, boolean regular) {
        if (name == null) {
            throw new IllegalArgumentException("Name cannot be null");
        }
        this.name = name;
        this.regular = regular;
    }


    public List<ServiceTimeSlot> addTimeSlot(String name, DateTime fromTime, DateTime toTime) {
        if (!timeSlots.add(new ServiceTimeSlotImpl(name, fromTime, toTime))) {
            throw new IllegalArgumentException(
                    String.format("%s already present in timeslots", name));
        }
        return ImmutableList.copyOf(timeSlots);
    }


    public boolean isTimeSlotPresent(ServiceTimeSlot timeslot) {
        return timeSlots.contains(timeslot);
    }

    public List<ServiceTimeSlot> removeTimeSlot(ServiceTimeSlot timeslot) {
        timeSlots.remove(timeslot);
        return ImmutableList.copyOf(timeSlots);
    }


    public List<ServiceTimeSlot> getTimeSlots() {
        return ImmutableList.copyOf(timeSlots);
    }

    public String getName() {
        return name;
    }

    public boolean isRegular() {
        return regular;
    }



    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }

        if (obj == this) {
            return true;
        }

        if (obj.getClass() != TimeSlotSchoolService.class) {
            return false;
        }

        TimeSlotSchoolService rhs = (TimeSlotSchoolService) obj;
        return Objects.equals(name, rhs.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name);
    }

    @Override
    public String toString() {
        return MoreObjects.toStringHelper(this).add("name", name).add("regular", regular)
                .add("timeSlots", timeSlots).toString();
    }

    public interface ServiceTimeSlot {
        String getName();

        DateTime getFromTime();

        DateTime getToTime();
    }


    private static class ServiceTimeSlotImpl implements ServiceTimeSlot {
        String name;
        DateTime fromTime;
        DateTime toTime;


        public ServiceTimeSlotImpl(@Nonnull String name, @Nonnull DateTime fromTime,
                @Nonnull DateTime toTime) {
            if (name == null || fromTime == null || toTime == null) {
                throw new IllegalArgumentException("All params must have a value");
            }
            this.name = name;
            this.fromTime = fromTime;
            this.toTime = toTime;
        }

        @Override
        public String getName() {
            return name;
        }

        @Override
        public DateTime getFromTime() {
            return fromTime;
        }

        @Override
        public DateTime getToTime() {
            return toTime;
        }

        @Override
        public boolean equals(Object obj) {
            if (obj == null) {
                return false;
            }

            if (obj == this) {
                return true;
            }

            if (obj.getClass() != ServiceTimeSlotImpl.class) {
                return false;
            }

            ServiceTimeSlotImpl rhs = (ServiceTimeSlotImpl) obj;
            return Objects.equals(name, rhs.name);
        }

        @Override
        public int hashCode() {
            return Objects.hashCode(name);
        }

        @Override
        public String toString() {
            return MoreObjects.toStringHelper(this).add("name", name)
                    .add("fromTime", DateTimeFormat.shortTime().print(fromTime))
                    .add("toTime", DateTimeFormat.shortTime().print(toTime)).toString();
        }
    }

}
