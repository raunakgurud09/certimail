package main

import (
	"bufio"
	"fmt"
	"log"
	"net"
	"os"
	"strings"
)

func main() {
	scanner := bufio.NewScanner(os.Stdin)

	// fmt.Printf("domain, hasMX, hasSPF, sprRecord, hasDMARC, dmarcRecord\n")

	for scanner.Scan() {
		// checkDomain(scanner.Text())
		checker(scanner.Text())
	}

	if err := scanner.Err(); err != nil {
		log.Fatal("Error: could not read from the input %v\n", err)
	}

}
func _checkDomain(domain string) {

	var hasMX, hasSPF, hasDMARC bool
	var spfRecord, dmarcRecord string

	mxRecords, err := net.LookupMX(domain)

	if err != nil {
		log.Printf("Error %v \n", err)
	}

	if len(mxRecords) > 0 {
		hasMX = true
	}

	txtRecords, err := net.LookupTXT(domain)
	if err != nil {
		log.Printf("Error %v \n", err)
	}

	for _, record := range txtRecords {
		if strings.HasPrefix(record, "v=spf1") {
			hasSPF = true
			spfRecord = record
			break
		}
	}

	dmarcRecords, err := net.LookupTXT("_dmarc." + domain)
	if err != nil {
		log.Printf("Error : %v \n", err)
	}

	for _, record := range dmarcRecords {
		if strings.HasPrefix(record, "v=DMARC") {
			hasDMARC = true
			dmarcRecord = record
			break
		}

	}

	fmt.Printf("%v ,%v, %v, %v, %v, %v", domain, hasMX, hasSPF, spfRecord, hasDMARC, dmarcRecord)

}

func checker(email string) {
	var (
		serverHostName    = "smtp.myserver.com"       // set your SMTP server here
		serverMailAddress = "raunakgurud09@gmail.com" // set your valid mail address here
	)
	err := ValidateHostAndUser(serverHostName, serverMailAddress, email)

	smtpErr, _ := err.(SmtpError)

	if err != nil {
		fmt.Printf("Code: %s, Msg: %s \n", smtpErr.Code(), smtpErr)
	} else {
		fmt.Print("Verified email \n")
	}

}
