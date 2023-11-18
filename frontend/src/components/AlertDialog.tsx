import React from "react";
import { Button, Dialog, DialogActions, DialogTitle, Slide, Typography, styled } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
    children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface AlertDialogProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    alertText: string;
}

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    textAlign: 'center',
    '& > *': {
    fontWeight: 'bold',
    },
}));

const StyledButton = styled(Button)(({ theme }) => ({
    color: theme.palette.primary.main,
    fontWeight: 'bold',
}));

const AlertDialog: React.FC<AlertDialogProps> = ({ open, setOpen, alertText }) => {

    const handleClose = () => {
    setOpen(false);
    };

    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            aria-describedby="alert-dialog-slide-description"
            >
            <StyledDialogTitle>
                <Typography variant="h6">{alertText}</Typography>
            </StyledDialogTitle>
            
            <DialogActions>
                <StyledButton onClick={handleClose} variant="text">Close</StyledButton>
            </DialogActions>
        </Dialog>
    );
}

export default AlertDialog;