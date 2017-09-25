/*******************************************************************************
 * Copyright 2015 Fondazione Bruno Kessler
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 ******************************************************************************/
package it.smartcommunitylab.ungiorno.model;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * @author raman
 *
 */
public class SchoolProfile extends SchoolObject {

    public static class Timing {
        private String fromTime, toTime;

        public String getFromTime() {
            return fromTime;
        }

        public void setFromTime(String fromTime) {
            this.fromTime = fromTime;
        }

        public String getToTime() {
            return toTime;
        }

        public void setToTime(String toTime) {
            this.toTime = toTime;
        }
    }

    public static class SectionProfile {
        private String sectionId, name;

        public String getSectionId() {
            return sectionId;
        }

        public void setSectionId(String sectionId) {
            this.sectionId = sectionId;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }

    public static class BusProfile {
        private String busId, name;
        private int capacity;

        public String getBusId() {
            return busId;
        }

        public void setBusId(String busId) {
            this.busId = busId;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public int getCapacity() {
            return capacity;
        }

        public void setCapacity(int capacity) {
            this.capacity = capacity;
        }
    }

    private String name;
    private String address;
    private Timing regularTiming, anticipoTiming, posticipoTiming;
    private Contact contacts;
    private List<TypeDef> absenceTypes;
    private List<TypeDef> frequentIllnesses;
    private List<TypeDef> teacherNoteTypes;
    private List<TypeDef> foodTypes;
    private List<SectionProfile> sections;
    private List<BusProfile> buses;
    private String absenceTiming, retireTiming;
    private String accessEmail;
    private Set<TimeSlotSchoolService> timeSlotServices;

    public SchoolProfile(TimeSlotSchoolService regular) {
        timeSlotServices = new LinkedHashSet<>();
        timeSlotServices.add(regular);
    }

    /*
     * FIXME: Actually to maintain because the class is used as Java Bean: serialized in JSON to be
     * persisted and sent to the web clients
     */
    public SchoolProfile() {

    }

    public String getAccessEmail() {
        return accessEmail;
    }

    public void setAccessEmail(String accessEmail) {
        this.accessEmail = accessEmail;
    }

    public String getAbsenceTiming() {
        return absenceTiming;
    }

    public void setAbsenceTiming(String absenceTiming) {
        this.absenceTiming = absenceTiming;
    }

    public String getRetireTiming() {
        return retireTiming;
    }

    public void setRetireTiming(String retireTiming) {
        this.retireTiming = retireTiming;
    }

    public Timing getRegularTiming() {
        return regularTiming;
    }

    public void setRegularTiming(Timing regularTiming) {
        this.regularTiming = regularTiming;
    }

    public Contact getContacts() {
        return contacts;
    }

    public void setContacts(Contact contacts) {
        this.contacts = contacts;
    }

    public List<TypeDef> getAbsenceTypes() {
        return absenceTypes;
    }

    public void setAbsenceTypes(List<TypeDef> absenceTypes) {
        this.absenceTypes = absenceTypes;
    }

    public List<TypeDef> getFrequentIllnesses() {
        return frequentIllnesses;
    }

    public void setFrequentIllnesses(List<TypeDef> frequentIllnesses) {
        this.frequentIllnesses = frequentIllnesses;
    }

    public List<TypeDef> getTeacherNoteTypes() {
        return teacherNoteTypes;
    }

    public void setTeacherNoteTypes(List<TypeDef> teacherNoteTypes) {
        this.teacherNoteTypes = teacherNoteTypes;
    }

    public List<TypeDef> getFoodTypes() {
        return foodTypes;
    }

    public void setFoodTypes(List<TypeDef> foodTypes) {
        this.foodTypes = foodTypes;
    }

    public Timing getAnticipoTiming() {
        return anticipoTiming;
    }

    public void setAnticipoTiming(Timing anticipoTiming) {
        this.anticipoTiming = anticipoTiming;
    }

    public Timing getPosticipoTiming() {
        return posticipoTiming;
    }

    public void setPosticipoTiming(Timing posticipoTiming) {
        this.posticipoTiming = posticipoTiming;
    }

    public List<SectionProfile> getSections() {
        return sections;
    }

    public void setSections(List<SectionProfile> sections) {
        this.sections = sections;
    }

    public List<BusProfile> getBuses() {
        return buses;
    }

    public void setBuses(List<BusProfile> buses) {
        this.buses = buses;
    }

    private String _id;

    public String get_id() {
        return _id;
    }

    public void set_id(String _id) {
        this._id = _id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Set<TimeSlotSchoolService> getTimeSlotServices() {
        return timeSlotServices;
    }

    /*
     * FIXME: not the best way to expose directly internal collection
     */
    public void setTimeSlotServices(Set<TimeSlotSchoolService> timeSlotServices) {
        this.timeSlotServices = timeSlotServices;
    }
}
