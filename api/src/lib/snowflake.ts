import { config } from "../config";
import Long from "long";

class Snowflake {
  public static readonly epochTime: number = config.epochTime;
  public static readonly machineId: number = config.machineId;

  public static readonly machineIdBits = 10;
  public static readonly sequenceIdBits = 12;

  public static readonly maxMachineId = Math.pow(2, Snowflake.machineIdBits);
  public static readonly maxSequenceId = Math.pow(2, Snowflake.sequenceIdBits);

  public static readonly machineIdShift = Snowflake.sequenceIdBits;
  public static readonly timestampShift = Snowflake.sequenceIdBits + Snowflake.machineIdBits;

  public lastTimestamp: number = -1;

  public timestamp: number = Date.now();
  public sequenceId: number = 0;

  constructor() {
    if (Snowflake.machineId >= Snowflake.maxMachineId) {
      throw "Machine id can't be bigger than or equal to max machine id."
    }

    if (Snowflake.machineId < 0) {
      throw "Machine id can't be less than 0."
    }
  }

  public id() {
    this.timestamp = Date.now();

    // If clock somehow went back in time
    if (this.timestamp < this.lastTimestamp) {
      this.timestamp = this.lastTimestamp;
    }

    if (this.timestamp === this.lastTimestamp) {
      this.sequenceId = (this.sequenceId + 1) % Snowflake.maxSequenceId;
      if (this.sequenceId === 0) this.timestamp++;
    }
    else {
      this.sequenceId = 0;
    }

    this.lastTimestamp = this.timestamp;

    const timestamp = Long.fromNumber(this.timestamp - Snowflake.epochTime).shiftLeft(Snowflake.timestampShift);
    const machineId = Long.fromNumber(Snowflake.machineId).shiftLeft(Snowflake.machineIdShift);
    const sequenceId = Long.fromNumber(this.sequenceId);

    return timestamp.add(machineId).add(sequenceId).toString();
  }
}

const generators = {
  "users": new Snowflake(),
  "user_follows": new Snowflake(),
  "user_blocks": new Snowflake(),
  
  "discussions": new Snowflake(),
  "discussion_favourites": new Snowflake(),
  "discussion_comments": new Snowflake(),
  "discussion_arguments": new Snowflake(),
  "argument_votes": new Snowflake(),
}

function id(generator: keyof typeof generators) {
  return generators[generator].id();
}

export const snowflake = { id }