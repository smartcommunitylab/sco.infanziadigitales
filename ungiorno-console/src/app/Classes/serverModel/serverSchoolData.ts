import {SchoolContacts} from '../schoolContacts';
import {TypeDef} from './typeDef';

export class ServerSchoolData {
    schoolId : string;
    name : string;
    address : string;
    contacts : SchoolContacts;
    accessEmail : string;
    absenceTiming : string;
    retireTiming : string;
    absenceTypes : TypeDef[];
    frequentIllnesses : TypeDef[];

    static readonly ILLNESS_VALUE : string = 'Malattia';
    static readonly FAMILY_MOTIVATION_VALUE : string = 'Motivi Familiari';
}


 // private Timing regularTiming, anticipoTiming, posticipoTiming;
    // private List<TypeDef> absenceTypes;
    // private List<TypeDef> frequentIllnesses;
    // private List<TypeDef> teacherNoteTypes;
    // private List<TypeDef> foodTypes;
    // private List<SectionProfile> sections;
    // private List<BusProfile> buses;
    // private String absenceTiming, retireTiming;
    // private String accessEmail;