package it.smartcommunitylab.ungiorno.model;


public class KidData {
	private KidProfile profile;
	private KidCalEntrata entrata;
	private KidCalRitiro ritiro;
	private KidCalAssenza assenza;
	
	public KidProfile getProfile() {
		return profile;
	}
	public void setProfile(KidProfile profile) {
		this.profile = profile;
	}
	public KidCalEntrata getEntrata() {
		return entrata;
	}
	public void setEntrata(KidCalEntrata entrata) {
		this.entrata = entrata;
	}
	public KidCalRitiro getRitiro() {
		return ritiro;
	}
	public void setRitiro(KidCalRitiro ritiro) {
		this.ritiro = ritiro;
	}
	public KidCalAssenza getAssenza() {
		return assenza;
	}
	public void setAssenza(KidCalAssenza assenza) {
		this.assenza = assenza;
	}
}
