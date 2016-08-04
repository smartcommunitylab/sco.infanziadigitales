package it.smartcommunitylab.ungiorno.model;

import java.util.List;

import com.google.common.collect.Lists;

public class Bus extends SchoolObject {
	private String busId;
	private String name;
	private List<String> stops = Lists.newArrayList();
	
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
	public List<String> getStops() {
		return stops;
	}
	public void setStops(List<String> stops) {
		this.stops = stops;
	}
}
