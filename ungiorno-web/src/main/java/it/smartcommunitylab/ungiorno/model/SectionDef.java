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

import org.apache.commons.lang.builder.EqualsBuilder;
import org.apache.commons.lang.builder.HashCodeBuilder;

import com.google.common.base.MoreObjects;

/**
 * @author raman
 *
 */
public class SectionDef {
    // actually title and level are never used ???
    private String sectionId, title, level;
    private boolean group;

    public String getSectionId() {
        return sectionId;
    }

    public void setSectionId(String sectionId) {
        this.sectionId = sectionId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public boolean isGroup() {
        return group;
    }

    public void setGroup(boolean group) {
        this.group = group;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }
        if (this == obj) {
            return true;
        }

        if (getClass() != obj.getClass()) {
            return false;
        }
        SectionDef rhs = (SectionDef) obj;

        return new EqualsBuilder().append(sectionId, rhs.sectionId).isEquals();
    }

    @Override
    public int hashCode() {
        return new HashCodeBuilder(23, 9).append(sectionId).toHashCode();
    }

    @Override
    public String toString() {
        return MoreObjects.toStringHelper(SectionDef.class).add("sectionId", sectionId)
                .add("group", group).toString();
    }
}
