package it.smartcommunitylab.ungiorno.usage;


public class UsageEntity implements Comparable<UsageEntity> {

	private long timestamp;

	public enum UsageActor {
		TEACHER, PARENT, KID
	};

	public enum UsageAction {
		MESSAGE, RETURN, ABSENCE
	};

	private String description;
	
	private UsageActor from;
	private UsageActor to;
	
	private String fromId;
	private String toId;
	
	private UsageAction action;

	private String appId;
	private String schoolId;
	
	private Object extra;

	public UsageEntity() {
	}

	public UsageEntity(String description, UsageActor from, UsageActor to, String fromId, String toId, UsageAction action, Object extra, String appId, String schoolId) {
		super();
		this.description = description;
		this.from = from;
		this.to = to;
		this.fromId = fromId;
		this.toId = toId;
		this.action = action;
		this.extra = extra;
		this.appId = appId;
		this.schoolId = schoolId;
		this.timestamp = System.currentTimeMillis();
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getAppId() {
		return appId;
	}

	public void setAppId(String appId) {
		this.appId = appId;
	}

	public String getSchoolId() {
		return schoolId;
	}

	public void setSchoolId(String schoolId) {
		this.schoolId = schoolId;
	}

	public long getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(long timestamp) {
		this.timestamp = timestamp;
	}

	public UsageActor getFrom() {
		return from;
	}

	public void setFrom(UsageActor from) {
		this.from = from;
	}

	public UsageActor getTo() {
		return to;
	}

	public String getFromId() {
		return fromId;
	}

	public void setFromId(String fromId) {
		this.fromId = fromId;
	}

	public String getToId() {
		return toId;
	}

	public void setToId(String toId) {
		this.toId = toId;
	}

	public void setTo(UsageActor to) {
		this.to = to;
	}

	public UsageAction getAction() {
		return action;
	}

	public void setAction(UsageAction action) {
		this.action = action;
	}

	public Object getExtra() {
		return extra;
	}

	public void setExtra(Object extra) {
		this.extra = extra;
	}

	@Override
	public int compareTo(UsageEntity o) {
		return (int)((timestamp - o.timestamp) / 1000L);
	}

}
