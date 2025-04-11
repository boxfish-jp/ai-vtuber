let workFlowState = true;

export const getWorkFlowState = () => {
	return workFlowState;
};

export const setWorkFlowState = (state: boolean) => {
	workFlowState = state;
};
