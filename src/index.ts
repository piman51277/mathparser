import { preprocessor } from "./preprocessor";

const input = "4x - \\sin{32} * 43^3( 29 - 4)";

console.log(preprocessor(input).join(" "));