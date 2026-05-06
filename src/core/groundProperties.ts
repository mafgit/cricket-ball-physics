export interface GroundProperties {
	cor: number; // coeff of restitution
	cof: number; // coeff of friction
	corr: number; // coeff of rolling resistance
}

export const hardPitch: GroundProperties = {
	cor: 0.6,
	cof: 0.4,
	corr: 0.012,
};

export const grassyPitch: GroundProperties = {
	cor: 0.51,
	cof: 0.3,
	corr: 0.025,
};

export const dryDustyPitch: GroundProperties = {
	cor: 0.44,
	cof: 0.63,
	corr: 0.032,
};

export const softPitch: GroundProperties = {
	cor: 0.35,
	cof: 0.25,
	corr: 0.042,
};

export const outfield: GroundProperties = {
	cof: 0.45,
	cor: 0.2,
	corr: 0.08,
};
