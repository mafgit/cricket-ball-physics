export interface GroundProperties {
	cor: number; // coeff of restitution
	cof: number; // coeff of friction
	corr: number; // coeff of rolling resistance
}

export const hardPitch: GroundProperties = {
	cor: 0.7,
	cof: 0.4,
	corr: 0.3,
};

export const grassyPitch: GroundProperties = {
	cor: 0.58,
	cof: 0.3,
	corr: 0.3,
};

export const dryDustyPitch: GroundProperties = {
	cor: 0.49,
	cof: 0.63,
	corr: 0.3,
};

export const softPitch: GroundProperties = {
	cor: 0.45,
	cof: 0.25,
	corr: 0.3,
};

export const outfield: GroundProperties = {
	cor: 0.3,
	cof: 0.45,
	corr: 0.3,
};
