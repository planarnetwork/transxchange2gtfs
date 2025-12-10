import {GTFSFileStream} from "./GTFSFileStream";
import {TransXChangeJourney} from "../transxchange/TransXChangeJourneyStream";
import {createHash} from 'crypto';
import {Location, RouteLink} from "../transxchange/TransXChange";

// https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  var R = 6371000; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180)
}

function routeLinkDistance(routeLink: RouteLink): number {
  let distance = 0;
  let lastLoc: Location | null = null;
  for (const location of routeLink.Locations) {
    if (lastLoc !== null) {
      distance += getDistanceFromLatLonInM(lastLoc.Latitude, lastLoc.Longitude, location.Latitude, location.Longitude);
    }
    lastLoc = location;
  }
  return distance;
}

/**
 * Generate shapes from the location data
 */
export class ShapesStream extends GTFSFileStream<TransXChangeJourney> {
  protected header = "shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence,shape_dist_traveled";

  protected existingShapes: Set<string> = new Set();

  protected transform(journey: TransXChangeJourney): void {
    let sequence = 0;
    const shapeId = createHash('md5').update(JSON.stringify({ routeId: journey.route, routeLinkSeq: journey.routeLinkIds })).digest("hex");

    if (this.existingShapes.has(shapeId)) {
      return;
    }
    this.existingShapes.add(shapeId);

    let lastLocAdded: Location | null = null;
    let distanceSoFarM = 0;

    for (const link of journey.routeLinks) {
      // In the TXC file, the distance is provided only for every route link and not in each point within it
      // For the GTFS file we need a distance for every point so we calculate this from the lat/long values
      // However this is slightly inaccurate so we scale everything so the overall distance matches
      const scaleFactor = link.Distance / routeLinkDistance(link);

      let linkDistance = 0;
      for (const location of link.Locations) {
        if (
          lastLocAdded !== null &&
          lastLocAdded.Latitude === location.Latitude &&
          lastLocAdded.Longitude === location.Longitude) {
          continue;
        }
        linkDistance += lastLocAdded ? getDistanceFromLatLonInM(lastLocAdded.Latitude, lastLocAdded.Longitude, location.Latitude, location.Longitude) : 0;

        this.pushLine(
          shapeId,
          location.Latitude,
          location.Longitude,
          sequence++,
          ((distanceSoFarM + linkDistance * scaleFactor) / 1000).toFixed(5)
        );

        lastLocAdded = location;
      }
      distanceSoFarM += link.Distance;
    }
  }

}

