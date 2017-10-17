package it.smartcommunitylab.ungiorno.beans;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Used by console-web to show aggregated informations about groups/sections
 * 
 * @author mirko
 *
 */
public class GroupDTO {
    private String id;
    private String name;
    @JsonProperty(value = "kids")
    private List<String> kidIds;
    @JsonProperty(value = "teachers")
    private List<String> teacherIds;
    /**
     * boolean, it identifies if group is a section
     */
    private boolean section;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getKidIds() {
        return kidIds;
    }

    public void setKidIds(List<String> kidIds) {
        this.kidIds = kidIds;
    }

    public List<String> getTeacherIds() {
        return teacherIds;
    }

    public void setTeacherIds(List<String> teacherIds) {
        this.teacherIds = teacherIds;
    }

    public boolean isSection() {
        return section;
    }

    public void setSection(boolean section) {
        this.section = section;
    }


}
