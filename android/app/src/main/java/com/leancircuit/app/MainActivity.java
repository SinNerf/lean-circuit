package com.leancircuit.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onStart() {
        super.onStart();
        ReleaseCheck.start(this);
    }
}
