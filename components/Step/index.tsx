import { LoadingButton } from "@mui/lab";
import { Button, Typography } from "@mui/material";
import { FC, ReactNode } from "react";

interface StepProps {
  title: string;
  errorTitle: string;
  completeTitle: string;
  applyButtonText: string;
  isButtonDisabled?: boolean;
  isStarted: boolean;
  isCompleted: boolean;
  isFetching: boolean;
  onStart: () => void;
  onApply: () => void;
  onReset: () => void;
  children: ReactNode;
}

const Step: FC<StepProps> = ({
  title,
  applyButtonText,
  completeTitle,
  errorTitle,
  isButtonDisabled,
  isStarted,
  isCompleted,
  isFetching,
  onStart,
  onApply,
  onReset,
  children,
}) => {
  return (
    <div>
      {!isStarted && (
        <Typography fontSize="1em" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      {!isStarted && (
        <Button variant="contained" onClick={onStart}>
          Запустить
        </Button>
      )}
      {isStarted && !isCompleted && (
        <>
          <Typography fontSize="1em" color="error" marginBottom="1em">
            {errorTitle}
          </Typography>
          {children}
          <LoadingButton
            size="large"
            loading={isFetching}
            variant="contained"
            sx={{ mt: 2, display: 'block', ml: 'auto', mr: 'auto' }}
            onClick={onApply}
            disabled={isButtonDisabled}
          >
            {applyButtonText}
          </LoadingButton>
        </>
      )}

      {isCompleted && (
        <>
          <Typography fontSize="1em" marginBottom="1em">
            {completeTitle}
          </Typography>
          <Button variant="contained" onClick={onReset}>
            Проверить еще раз
          </Button>
        </>
      )}
    </div>
  );
};

export default Step;
