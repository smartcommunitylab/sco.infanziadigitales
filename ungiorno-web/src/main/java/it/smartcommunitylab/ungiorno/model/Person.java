package it.smartcommunitylab.ungiorno.model;

public class Person extends SchoolObject {
	private String personId;
	private String firstName;
	private String lastName;
	private String fullName;
	private String email;
	private String phone;
	private boolean parent;
	private boolean adult;
	private String relation;
	private String username;
	private long authorizationDeadline;
	private boolean usingDefault;
	
	public String getPersonId() {
		return personId;
	}
	public void setPersonId(String personId) {
		this.personId = personId;
	}
	public String getFirstName() {
		return firstName;
	}
	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}
	public String getLastName() {
		return lastName;
	}
	public void setLastName(String lastName) {
		this.lastName = lastName;
	}
	public String getFullName() {
		return fullName;
	}
	public void setFullName(String fullName) {
		this.fullName = fullName;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getPhone() {
		return phone;
	}
	public void setPhone(String phone) {
		this.phone = phone;
	}
	public boolean isParent() {
		return parent;
	}
	public void setParent(boolean parent) {
		this.parent = parent;
	}
	public boolean isAdult() {
		return adult;
	}
	public void setAdult(boolean adult) {
		this.adult = adult;
	}
	public String getRelation() {
		return relation;
	}
	public void setRelation(String relation) {
		this.relation = relation;
	}
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public long getAuthorizationDeadline() {
		return authorizationDeadline;
	}
	public void setAuthorizationDeadline(long authorizationDeadline) {
		this.authorizationDeadline = authorizationDeadline;
	}
	public boolean isUsingDefault() {
		return usingDefault;
	}
	public void setUsingDefault(boolean usingDefault) {
		this.usingDefault = usingDefault;
	}
	
}
