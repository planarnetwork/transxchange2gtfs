import {TransXChange, StopPoint} from "../transxchange/TransXChange";
import {ATCOCode, NaPTANIndex} from "../reference/NaPTAN";
import {GTFSFileStream} from "./GTFSFileStream";

export class StopsStream extends GTFSFileStream<TransXChange> {
  protected header = "stop_id,stop_code,stop_name,stop_desc,stop_lat,stop_lon,zone_id,stop_url,location_type,parent_station,stop_timezone,wheelchair_boarding";
  private static readonly STREET_BLACKLIST = ["Road", "Street", "Lane", "Avenue"];
  private readonly seenStops: Record<ATCOCode, boolean> = {};

  constructor(private readonly naptan: NaPTANIndex) {
    super();
  }

  protected transform(data: TransXChange): void {
    for (const stop of data.StopPoints) {
      if (!this.seenStops[stop.StopPointRef]) {
        this.pushLine(...this.getStop(stop));
        this.seenStops[stop.StopPointRef] = true;
      }
    }
  }

  private getStop(stop: StopPoint): Array<string | number> {
    return this.naptan[stop.StopPointRef] ? this.getNaPTANStop(this.naptan[stop.StopPointRef]) : this.getFeedStop(stop);
  }

  private getNaPTANStop([atcoCode, naptanCode, name, street, indicator, locality, parent, lng, lat]: string[]): Array<string | number> {
    const specificStreet = this.shouldAddStreet(name, street) ? ", " + street : "";
    const specificLocation = indicator !== "" ? " (" + indicator.replace("->", "") + ")" : "";
    const city = parent || locality;

    return [
      atcoCode,
      naptanCode,
      name /*+ specificLocation + specificStreet + ", " + city*/,
      name,
      lat,
      lng,
      "",
      "",
      "",
      "",
      "",
      0
    ];
  }

  private getFeedStop(stop: StopPoint): Array<string | number> {
    return [
      stop.StopPointRef,
      "",
      stop.CommonName + ", " + stop.LocalityQualifier,
      "",
      stop.Location.Latitude,
      stop.Location.Longitude,
      "",
      "",
      "",
      "",
      "",
      0
    ];
  }

  /**
   * If the name is not the same as the street name and does not contain any words like Road or Street we can safely
   * add the street name to the name.
   */
  private shouldAddStreet(name: string, street: string): boolean {
    return street.length > 1
      && name !== street
      && street !== "---"
      && StopsStream.STREET_BLACKLIST.every(i => !name.includes(i));
  }
}
