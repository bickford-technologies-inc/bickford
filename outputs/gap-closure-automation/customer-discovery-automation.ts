#!/usr/bin/env ts-node
/**
 * Customer Discovery Automation System
 * Automated customer interview scheduling, tracking, and analysis
 */

import * as fs from "fs";
import * as path from "path";
import { createClient } from "redis";
import { v4 as uuidv4 } from "uuid";

import { Customer } from "./models/Customer";
import { Interview } from "./models/Interview";
import { Interviewer } from "./models/Interviewer";
import { InterviewSchedule } from "./models/InterviewSchedule";
import { InterviewStatus } from "./models/InterviewStatus";
import { InterviewType } from "./models/InterviewType";
import { Location } from "./models/Location";
import { Meeting } from "./models/Meeting";
import { MeetingStatus } from "./models/MeetingStatus";
import { MeetingType } from "./models/MeetingType";
import { Participant } from "./models/Participant";
import { ParticipantStatus } from "./models/ParticipantStatus";
import { ParticipantType } from "./models/ParticipantType";
import { Question } from "./models/Question";
import { QuestionType } from "./models/QuestionType";
import { Response } from "./models/Response";
import { ResponseType } from "./models/ResponseType";
import { Session } from "./models/Session";
import { SessionStatus } from "./models/SessionStatus";
import { SessionType } from "./models/SessionType";
import { User } from "./models/User";
