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

public class KidWeeks extends SchoolObject {

    private int weeknr;
    private String kidId;
    private List<KidProfile.DayDefault> days;

    public int getWeeknr() {
        return weeknr;
    }

    public void setWeeknr(int nr) {
        this.weeknr = nr;
    }

    public String getKidId() {
        return kidId;
    }

    public void setKidId(String kidId) {
        this.kidId = kidId;
    }

    public List<KidProfile.DayDefault> getDays() {
        return days;
    }

    public void setDays(List<KidProfile.DayDefault> daysEx) {
        this.days = daysEx;
    }

}
