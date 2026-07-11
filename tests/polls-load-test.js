import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 1000,
  duration: "30s",
};

export default function () {
  const res = http.get("http://host.docker.internal:5000/api/polls");

  check(res, {
    "Status is 200": (r) => r.status === 200,
    "Response time < 1000ms": (r) => r.timings.duration < 1000,
  });
}