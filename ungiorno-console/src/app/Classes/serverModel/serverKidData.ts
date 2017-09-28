import { AuthPerson } from "./authPerson";
import { KidServices } from "./kidServices";
import { Allergy } from "./allergy"

export class ServerKidData {
	kidId: string;
	fullname: string;
	lastName: string;
	firstName: string;
	image: string;
	section: any;
	services: KidServices;
	persons: AuthPerson[];
	allergies: Allergy[];
	birthDate: Date;
	partecipateToSperimentation :boolean;
	gender: string;

    // private String kidId, fullName, lastName, firstName, image;
	// private SectionDef section;
	// private KidServices services;
	// private List<AuthPerson> persons;
	// private List<Allergy> allergies;
	// private boolean active = true;
    
    constructor() {
		this.services = new KidServices();

	}
   
}