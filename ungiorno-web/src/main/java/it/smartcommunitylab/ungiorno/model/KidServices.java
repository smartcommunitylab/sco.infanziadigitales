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

import java.util.List;

import it.smartcommunitylab.ungiorno.controller.serializers.TimeSlotServiceJsonDeserializer;
import it.smartcommunitylab.ungiorno.controller.serializers.TimeSlotServiceJsonSerializer;

/**
 * @author raman
 *
 */
public class KidServices {

    private SchoolService anticipo, posticipo, mensa;
    private BusService bus;
    /**
     * the serialization process of this class is maneged by {@link TimeSlotServiceJsonSerializer}
     * and {@link TimeSlotServiceJsonDeserializer}
     */
    private List<TimeSlotSchoolService> timeSlotServices;


    public SchoolService getAnticipo() {
        return anticipo;
    }

    public void setAnticipo(SchoolService anticipo) {
        this.anticipo = anticipo;
    }

    public SchoolService getPosticipo() {
        return posticipo;
    }

    public void setPosticipo(SchoolService posticipo) {
        this.posticipo = posticipo;
    }

    public SchoolService getMensa() {
        return mensa;
    }

    public void setMensa(SchoolService mensa) {
        this.mensa = mensa;
    }

    public BusService getBus() {
        return bus;
    }

    public void setBus(BusService bus) {
        this.bus = bus;
    }

    public List<TimeSlotSchoolService> getTimeSlotServices() {
        return timeSlotServices;
    }

    public void setTimeSlotServices(List<TimeSlotSchoolService> timeSlotServices) {
        this.timeSlotServices = timeSlotServices;
    }
}
